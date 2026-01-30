import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from '../asesores/entities/asesore.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { SiacController } from './siac.controller';
import { SiacService } from './siac.service';
import { MediaModule } from '../media/media.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asesor, Mensaje]),
    MediaModule
  ],
  controllers: [SiacController],
  providers: [SiacService],
})
export class SiacModule {}
