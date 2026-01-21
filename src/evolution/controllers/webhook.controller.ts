import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { EVENTOS_IGNORADOS } from '../constantes/eventos';
import { Unprotected } from 'nest-keycloak-connect';

@Controller('webhook/evolution')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @Unprotected()  
  async handleWebhook(@Body() payload: any) {
    if (!EVENTOS_IGNORADOS.includes(payload?.event)) {
      const resumen = this.webhookService.resumirObjeto(payload);
      this.logEvento(payload.event, resumen);
    }

    const resultado = await this.webhookService.processEvent(payload);

    if (!resultado) {
      return { status: 'ignored' };
    }

    return { status: 'ok' };
  }

  private logEvento(evento: string, resumen: any) {
    console.log('\n==============================');
    console.log('🚀 Nuevo evento Evolution');
    console.log('📌 Tipo:', evento ?? 'desconocido');
    console.log('------------------------------');
    console.log('📩 Payload:', JSON.stringify(resumen, null, 2));
    console.log('==============================\n');
  }
}
