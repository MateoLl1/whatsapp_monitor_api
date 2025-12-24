import { Module } from '@nestjs/common';
import { AsesoresService } from './asesores.service';
import { AsesoresController } from './asesores.controller';

@Module({
  controllers: [AsesoresController],
  providers: [AsesoresService],
})
export class AsesoresModule {}
