import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesorConexionesService } from './asesor-conexiones.service';
import { AsesorConexion } from './entities/asesor-conexion.entity';
import { Asesor } from '../asesores/entities/asesore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsesorConexion,Asesor])],
  providers: [AsesorConexionesService],
  exports: [AsesorConexionesService],
})
export class AsesorConexionesModule {}