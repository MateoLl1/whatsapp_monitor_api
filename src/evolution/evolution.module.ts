import { Module } from '@nestjs/common';
import { EvolutionService } from './evolution.service';
import { EvolutionController } from './evolution.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from '../asesores/entities/asesore.entity';

@Module({
  imports: [
    HttpModule, 
    TypeOrmModule.forFeature([Asesor]),
  ],
  providers: [EvolutionService],
  controllers: [EvolutionController],
  exports: [EvolutionService],
})
export class EvolutionModule {}
