import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from '../asesores/entities/asesore.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { SiacController } from './siac.controller';
import { SiacService } from './siac.service';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asesor, Mensaje]),
    FilesModule
  ],
  controllers: [SiacController],
  providers: [SiacService],
})
export class SiacModule {}
