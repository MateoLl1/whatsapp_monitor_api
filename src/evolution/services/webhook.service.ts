import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
  private readonly eventosIgnorados: string[] = [
    'contacts.update',
    'chats.set',
  ];

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
    if (this.eventosIgnorados.includes(payload?.event)) {
      return null;
    }

    return this.resumirObjeto(payload);
  }
}
