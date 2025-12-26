import { Module } from '@nestjs/common';
import { ConversacionesService } from './conversaciones.service';
import { ConversacionesController } from './conversaciones.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversacion } from './entities/conversacion.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Conversacion])
  ],
  controllers: [ConversacionesController],
  providers: [ConversacionesService],
})
export class ConversacionesModule {}
