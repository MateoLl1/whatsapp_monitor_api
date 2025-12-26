import { Module } from '@nestjs/common';
import { AsesoresService } from './asesores.service';
import { AsesoresController } from './asesores.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asesor } from './entities/asesore.entity';
import { EvolutionModule } from '../evolution/evolution.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asesor]),
    EvolutionModule,
  ],
  controllers: [AsesoresController],
  providers: [AsesoresService],
})
export class AsesoresModule {}
