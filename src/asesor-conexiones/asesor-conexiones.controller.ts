import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common';
import { AsesorConexionesService } from './asesor-conexiones.service';

@Controller('asesor-conexiones')
export class AsesorConexionesController {
  constructor(
    private readonly asesorConexionesService: AsesorConexionesService,
  ) {}

  @Get('resumen')
  async resumen(
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    return this.asesorConexionesService.obtenerResumen(fechaInicio, fechaFin);
  }

  @Get('por-asesor')
  async porAsesor(
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    return this.asesorConexionesService.obtenerResumenPorAsesor(fechaInicio, fechaFin);
  }

  @Get('estado-actual')
  async estadoActual() {
    return this.asesorConexionesService.obtenerEstadoActualPorAsesor();
  }

  @Get('timeline/:asesorId')
  async timeline(
    @Param('asesorId', ParseIntPipe) asesorId: number,
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
  ) {
    return this.asesorConexionesService.obtenerTimelinePorAsesor(
      asesorId,
      fechaInicio,
      fechaFin,
    );
  }
}