import { Module } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { MensajesController } from './mensajes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { Conversacion } from '../conversaciones/entities/conversacion.entity';
import { EvolutionModule } from '../evolution/evolution.module';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mensaje,Conversacion]),
    EvolutionModule,
    FilesModule
  ],
  controllers: [MensajesController],
  providers: [MensajesService],
})
export class MensajesModule {}
