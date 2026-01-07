import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Controller('webhook/evolution')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleWebhook(@Body() payload: any) {
    const resumen = await this.webhookService.processEvent(payload);

    if (!resumen) {
      // 🚫 Evento ignorado
      return { status: 'ignored' };
    }

    console.log('\n==============================');
    console.log('🚀 Nuevo evento Evolution');
    console.log('📌 Tipo:', payload?.event ?? 'desconocido');
    console.log('------------------------------');
    console.log('📩 Resumen:', JSON.stringify(resumen, null, 2));
    console.log('==============================\n');

    return { status: 'ok' };
  }
}
