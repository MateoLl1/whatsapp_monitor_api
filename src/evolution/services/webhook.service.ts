import { Injectable } from '@nestjs/common';
import { EVENTOS_IGNORADOS, EVENTOS_IMPORTANTES } from '../constantes/eventos';
import { Repository } from 'typeorm';
import { Asesor } from '../../asesores/entities/asesore.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(Asesor)
    private readonly asesoresRepo: Repository<Asesor>,
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
}
