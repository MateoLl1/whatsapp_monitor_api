import { Controller, Post, Body } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Controller('webhook/evolution')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  async handleWebhook(@Body() payload: any) {
    const resultado = await this.webhookService.processEvent(payload);

    if (!resultado) {
      return { status: 'ignored' };
    }

    this.logEvento(payload.event, resultado);
  }

  private logEvento(evento: string, resumen: any) {
    console.log('\n==============================');
    console.log('🚀 Nuevo evento Evolution');
    console.log('📌 Tipo:', evento ?? 'desconocido');
    console.log('------------------------------');
    console.log('📩 Resumen:', JSON.stringify(resumen, null, 2));
    console.log('==============================\n');
  }
}
