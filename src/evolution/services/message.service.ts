import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Asesor } from '../../asesores/entities/asesore.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversacion } from '../../conversaciones/entities/conversacion.entity';
import { Mensaje } from '../../mensajes/entities/mensaje.entity';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

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

  async decryptMedia(
    url: string,
    mediaKey: Buffer,
    type: 'audio' | 'image' | 'video' | 'sticker',
  ) {
    const encMedia = await axios.get(url, { responseType: 'arraybuffer' });
    let encBuffer = Buffer.from(encMedia.data);
    encBuffer = encBuffer.slice(0, encBuffer.length - 10);
    const info = `WhatsApp ${
      type.charAt(0).toUpperCase() + type.slice(1)
    } Keys`;
    const keyMaterial = Buffer.from(
      crypto.hkdfSync('sha256', mediaKey, Buffer.alloc(0), info, 80),
    );
    const iv = keyMaterial.slice(0, 16);
    const cipherKey = keyMaterial.slice(16, 48);
    const decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    const decrypted = Buffer.concat([
      decipher.update(encBuffer),
      decipher.final(),
    ]);
    return decrypted;
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

    if (data.message?.audioMessage) {
      const audio = data.message.audioMessage;
      const mediaKey = Buffer.from(Object.values(audio.mediaKey));
      const buffer = await this.decryptMedia(audio.url, mediaKey, 'audio');
      const objectName = `${data.key.id}.ogg`;
      const filePath = path.join(process.cwd(), 'downloads', objectName);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, buffer);
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
        ruta: filePath,
      };
    }

    if (data.message?.stickerMessage) {
      const sticker = data.message.stickerMessage;
      const mediaKey = Buffer.from(Object.values(sticker.mediaKey));
      const buffer = await this.decryptMedia(sticker.url, mediaKey, 'sticker');
      const objectName = `${data.key.id}.webp`;
      const filePath = path.join(process.cwd(), 'downloads', objectName);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, buffer);
      const mensaje = this.mensajesRepo.create({
        conversacion,
        mensaje: '',
        objeto: objectName,
        fecha,
        fromMe,
      });
      await this.mensajesRepo.save(mensaje);
      return {
        tipo: 'sticker',
        cliente: clienteNumero,
        asesor: asesorNumero,
        objeto: objectName,
        ruta: filePath,
      };
    }

    return { tipo: 'ignorado' };
  }
}
