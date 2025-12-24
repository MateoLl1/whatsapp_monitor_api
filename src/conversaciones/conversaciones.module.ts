import { Module } from '@nestjs/common';
import { ConversacionesService } from './conversaciones.service';
import { ConversacionesController } from './conversaciones.controller';

@Module({
  controllers: [ConversacionesController],
  providers: [ConversacionesService],
})
export class ConversacionesModule {}
