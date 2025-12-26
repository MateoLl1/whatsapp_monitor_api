import { Module } from '@nestjs/common';
import { MensajesService } from './mensajes.service';
import { MensajesController } from './mensajes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mensaje } from './entities/mensaje.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Mensaje])
  ],
  controllers: [MensajesController],
  providers: [MensajesService],
})
export class MensajesModule {}
