import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from '../asesores/entities/asesore.entity';

import { EvolutionController } from './controllers/evolution.controller';
import { WebhookController } from './controllers/webhook.controller';

import { InstanceService } from './services/instance.service';
import { MessageService } from './services/message.service';
import { WebhookService } from './services/webhook.service';
import { Conversacion } from '../conversaciones/entities/conversacion.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Asesor,Conversacion,Mensaje])],
  controllers: [EvolutionController, WebhookController],
  providers: [InstanceService, MessageService, WebhookService],
  exports: [InstanceService, MessageService],
})
export class EvolutionModule {}
