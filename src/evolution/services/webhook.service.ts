import { Injectable } from '@nestjs/common';
import { EVENTOS_IGNORADOS, EVENTOS_IMPORTANTES } from '../constantes/eventos';
import { Repository } from 'typeorm';
import { Asesor } from '../../asesores/entities/asesore.entity';
import { Conversacion } from '../../conversaciones/entities/conversacion.entity';
import { Mensaje } from '../../mensajes/entities/mensaje.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Asesor)
    private readonly asesoresRepo: Repository<Asesor>,
    @InjectRepository(Conversacion)
    private readonly conversacionesRepo: Repository<Conversacion>,
    @InjectRepository(Mensaje)
    private readonly mensajesRepo: Repository<Mensaje>,
  ) {}

  resumirObjeto(obj: any, maxLen = 200): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
      return obj.length > maxLen
        ? obj.substring(0, maxLen) + `... (${obj.length} chars)`
        : obj;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.resumirObjeto(item, maxLen));
    }
    if (typeof obj === 'object') {
      const resumen: any = {};
      for (const key of Object.keys(obj)) {
        resumen[key] = this.resumirObjeto(obj[key], maxLen);
      }
      return resumen;
    }
    return obj;
  }

  async processEvent(payload: any) {
    if (EVENTOS_IGNORADOS.includes(payload?.event)) {
      return null;
    }

    if (EVENTOS_IMPORTANTES.includes(payload?.event)) {
      switch (payload?.event) {
        case 'connection.update':
          return this.handleConnectionUpdate(payload);
        case 'messages.upsert':
          return this.handleMessageUpsert(payload);
        default:
          return this.resumirObjeto(payload);
      }
    }

    return null;
  }

  private async handleConnectionUpdate(payload: any) {
    const sender = payload?.sender;
    if (!sender) return null;

    const numero = sender.split('@')[0];
    const state = payload?.data?.state;

    if (state === 'open') {
      await this.setAsesorActivo(numero, true);
    } else if (state === 'close') {
      await this.setAsesorActivo(numero, false);
    }

    return { tipo: 'connection', numero, state };
  }

  private async setAsesorActivo(numero: string, activo: boolean) {
    await this.asesoresRepo.update({ numero_whatsapp: numero }, { activo });
  }

  private async handleMessageUpsert(payload: any) {
  const data = payload?.data;
  if (!data) return null;

  const fromMe = data.key?.fromMe;
  const clienteNumero = data.key?.remoteJid?.split('@')[0];
  const asesorNumero = payload?.sender?.split('@')[0];
  const contenido = data.message?.conversation ?? '';
  const fecha = new Date(Number(data.messageTimestamp) * 1000);

  // Buscar asesor
  const asesor = await this.asesoresRepo.findOne({
    where: { numero_whatsapp: asesorNumero },
  });
  if (!asesor) {
    throw new Error(`Asesor con número ${asesorNumero} no encontrado`);
  }

  // Buscar o crear conversación
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
      estado: 'activa',
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

  // Guardar mensaje
  const mensaje = this.mensajesRepo.create({
    conversacion,
    mensaje: contenido,
    fecha,
    fromMe,
  });
  await this.mensajesRepo.save(mensaje);

  return { tipo: 'mensaje', cliente: clienteNumero, asesor: asesorNumero, contenido };
}

}
