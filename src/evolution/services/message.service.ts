import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Asesor } from '../../asesores/entities/asesore.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversacion } from '../../conversaciones/entities/conversacion.entity';
import { Mensaje } from '../../mensajes/entities/mensaje.entity';
import axios from 'axios';
import { MinioService } from '../../files/minio.service';
@Injectable()
export class MessageService {
  private baseUrl = process.env.API_EVOLUTION_URL || 'http://localhost:8080';
  private apiKey = process.env.API_EVOLUTION_KEY;
  
  constructor(
    private readonly http: HttpService,
    @InjectRepository(Asesor)
    private readonly asesoresRepo: Repository<Asesor>,
    @InjectRepository(Conversacion)
    private readonly conversacionesRepo: Repository<Conversacion>,
    @InjectRepository(Mensaje)
    private readonly mensajesRepo: Repository<Mensaje>,
    private readonly minioService:MinioService
  ) {}

  async sendTextMessage(instanceName: string, number: string, text: string) {
    const response = await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/message/sendText/${instanceName}`,
        { number, text },
        { headers: { apikey: this.apiKey } },
      ),
    );
    return response.data;
  }

  async handleMessageUpsert(payload: any) {
    const data = payload?.data;
    if (!data) return null;

    const fromMe = data.key?.fromMe;
    const clienteNumero = data.key?.remoteJid?.split('@')[0];
    const asesorNumero = payload?.sender?.split('@')[0];
    const fecha = new Date(Number(data.messageTimestamp) * 1000);

    const asesor = await this.asesoresRepo.findOne({
      where: { numero_whatsapp: asesorNumero },
    });
    if (!asesor)
      throw new Error(`Asesor con número ${asesorNumero} no encontrado`);

    let conversacion = await this.conversacionesRepo.findOne({
      where: { cliente_numero: clienteNumero, asesor: { id: asesor.id } },
      relations: ['asesor'],
    });
    if (!conversacion) {
      conversacion = this.conversacionesRepo.create({
        cliente_numero: clienteNumero,
        nombre_cliente: fromMe ? null : data.pushName ?? null,
        inicio: fecha,
        fin: fecha,
        estado: 'ACTIVA',
        asesor,
      });
      conversacion = await this.conversacionesRepo.save(conversacion);
    } else {
      conversacion.fin = fecha;
      if (!conversacion.nombre_cliente && !fromMe) {
        conversacion.nombre_cliente = data.pushName ?? null;
      }
      await this.conversacionesRepo.save(conversacion);
    }

    // 🔹 Procesar texto
    if (data.message?.conversation) {
      const contenido = data.message.conversation;
      const mensaje = this.mensajesRepo.create({
        conversacion,
        mensaje: contenido,
        fecha,
        fromMe,
      });
      await this.mensajesRepo.save(mensaje);
      return {
        tipo: 'texto',
        cliente: clienteNumero,
        asesor: asesorNumero,
        contenido,
      };
    }

    // 🔹 Procesar audio
    if (data.message?.audioMessage) {
      const audio = data.message.audioMessage;
      const response = await axios.get(audio.url, {
        responseType: 'arraybuffer',
      });
      const buffer = Buffer.from(response.data);

      const objectName = `${data.key.id}.ogg`;
      await this.minioService.uploadFile(objectName, buffer);

      const mensaje = this.mensajesRepo.create({
        conversacion,
        mensaje: '',
        objeto: objectName,
        fecha,
        fromMe,
      });
      await this.mensajesRepo.save(mensaje);

      return {
        tipo: 'audio',
        cliente: clienteNumero,
        asesor: asesorNumero,
        objeto: objectName,
      };
    }

    return { tipo: 'ignorado' };
  }
}
