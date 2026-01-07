import { Injectable } from '@nestjs/common';
import { EVENTOS_IGNORADOS, EVENTOS_IMPORTANTES } from '../constantes/eventos';
@Injectable()
export class WebhookService {
  resumirObjeto(obj: any, maxLen = 200): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
      return obj.length > maxLen 
        ? obj.substring(0, maxLen) + `... (${obj.length} chars)` 
        : obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.resumirObjeto(item, maxLen));
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
    }/*
    if (EVENTOS_IMPORTANTES.includes(payload?.event)) {
      return this.resumirObjeto(payload);
    }*/
    return this.resumirObjeto(payload);
    return null;
  }
}
