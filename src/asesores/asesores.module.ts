import { Module } from '@nestjs/common';
import { AsesoresService } from './asesores.service';
import { AsesoresController } from './asesores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from './entities/asesore.entity';
import { EvolutionModule } from '../evolution/evolution.module';
import { Mensaje } from '../mensajes/entities/mensaje.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asesor,Mensaje]),
    EvolutionModule,
  ],
  controllers: [AsesoresController],
  providers: [AsesoresService],
})
export class AsesoresModule {}
