import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AsesorConexion } from './entities/asesor-conexion.entity';
import { EvolutionWebhookDto } from '../evolution/dto/evolution-webhook.dto';
import { Asesor } from '../asesores/entities/asesore.entity';

@Injectable()
export class AsesorConexionesService {
  constructor(
    @InjectRepository(AsesorConexion)
    private readonly asesorConexionesRepository: Repository<AsesorConexion>,
    @InjectRepository(Asesor)
    private readonly asesoresRepository: Repository<Asesor>,
  ) {}

  async registrarDesdeWebhook(payload: EvolutionWebhookDto): Promise<void> {
    const estado = this.mapearEstado(payload);

    if (!estado || !payload.instance) {
      return;
    }

    const asesor = await this.asesoresRepository.findOne({
      where: { nombre: payload.instance },
    });

    if (!asesor) {
      console.log(`No se encontró asesor con nombre: ${payload.instance}`);
      return;
    }

    const registro = this.asesorConexionesRepository.create({
      evento: payload.event,
      estado,
      fecha: payload.date_time
        ? this.parsearTimestampSinTimezone(payload.date_time)
        : new Date(),
      asesor,
    });

    await this.asesorConexionesRepository.save(registro);
  }

  async obtenerResumen(fechaInicio?: string, fechaFin?: string) {
    const where = this.construirWhereFechas(fechaInicio, fechaFin);

    const [total, open, close, qrcode, removed] = await Promise.all([
      this.asesorConexionesRepository.count({ where }),
      this.asesorConexionesRepository.count({
        where: { ...where, estado: 'open' },
      }),
      this.asesorConexionesRepository.count({
        where: { ...where, estado: 'close' },
      }),
      this.asesorConexionesRepository.count({
        where: { ...where, estado: 'qrcode' },
      }),
      this.asesorConexionesRepository.count({
        where: { ...where, estado: 'removed' },
      }),
    ]);

    return {
      total_eventos: total,
      total_open: open,
      total_close: close,
      total_qrcode: qrcode,
      total_removed: removed,
    };
  }

  async obtenerResumenPorAsesor(fechaInicio?: string, fechaFin?: string) {
    const where = this.construirWhereFechas(fechaInicio, fechaFin);

    const registros = await this.asesorConexionesRepository.find({
      where,
      relations: ['asesor'],
      order: { fecha: 'DESC' },
    });

    const mapa = new Map<number, any>();

    for (const item of registros) {
      const asesorId = item.asesor.id;

      if (!mapa.has(asesorId)) {
        mapa.set(asesorId, {
          asesor_id: item.asesor.id,
          asesor_nombre: item.asesor.nombre,
          total_open: 0,
          total_close: 0,
          total_qrcode: 0,
          total_removed: 0,
          ultima_conexion: null,
          ultima_desconexion: null,
          ultima_actividad: this.formatearFecha(item.fecha),
          estado_actual: item.estado,
        });
      }

      const actual = mapa.get(asesorId);

      if (item.estado === 'open') {
        actual.total_open += 1;
        if (!actual.ultima_conexion) {
          actual.ultima_conexion = this.formatearFecha(item.fecha);
        }
      }

      if (item.estado === 'close') {
        actual.total_close += 1;
        if (!actual.ultima_desconexion) {
          actual.ultima_desconexion = this.formatearFecha(item.fecha);
        }
      }

      if (item.estado === 'qrcode') {
        actual.total_qrcode += 1;
      }

      if (item.estado === 'removed') {
        actual.total_removed += 1;
      }
    }

    return Array.from(mapa.values()).sort((a, b) =>
      a.asesor_nombre.localeCompare(b.asesor_nombre),
    );
  }

  async obtenerEstadoActualPorAsesor() {
    const registros = await this.asesorConexionesRepository.find({
      relations: ['asesor'],
      order: { fecha: 'DESC' },
    });

    const mapa = new Map<number, any>();

    for (const item of registros) {
      const asesorId = item.asesor.id;

      if (!mapa.has(asesorId)) {
        mapa.set(asesorId, {
          asesor_id: item.asesor.id,
          asesor_nombre: item.asesor.nombre,
          ultimo_evento: item.evento,
          estado_actual: item.estado,
          fecha: this.formatearFecha(item.fecha),
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) =>
      a.asesor_nombre.localeCompare(b.asesor_nombre),
    );
  }

  async obtenerTimelinePorAsesor(
    asesorId: number,
    fechaInicio?: string,
    fechaFin?: string,
  ) {
    const where: any = {
      asesor: { id: asesorId },
    };

    if (fechaInicio && fechaFin) {
      where.fecha = Between(
        this.parsearFechaFiltroInicio(fechaInicio),
        this.parsearFechaFiltroFin(fechaFin),
      );
    }

    const registros = await this.asesorConexionesRepository.find({
      where,
      relations: ['asesor'],
      order: { fecha: 'DESC' },
    });

    return registros.map((item) => ({
      id: item.id,
      asesor_id: item.asesor.id,
      asesor_nombre: item.asesor.nombre,
      evento: item.evento,
      estado: item.estado,
      fecha: this.formatearFecha(item.fecha),
    }));
  }

  private construirWhereFechas(fechaInicio?: string, fechaFin?: string) {
    if (fechaInicio && fechaFin) {
      return {
        fecha: Between(
          this.parsearFechaFiltroInicio(fechaInicio),
          this.parsearFechaFiltroFin(fechaFin),
        ),
      };
    }

    return {};
  }

  private mapearEstado(payload: EvolutionWebhookDto): string | null {
    if (payload.event === 'qrcode.updated') {
      return 'qrcode';
    }

    if (payload.event === 'remove.instance') {
      return 'removed';
    }

    if (payload.event === 'connection.update') {
      if (payload.data?.state === 'connecting') {
        return 'connecting';
      }

      if (payload.data?.state === 'open') {
        return 'open';
      }

      if (payload.data?.state === 'close') {
        return 'close';
      }
    }

    return null;
  }

  private formatearFecha(fecha: Date): string {
    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, '0');
    const dd = String(fecha.getDate()).padStart(2, '0');
    const hh = String(fecha.getHours()).padStart(2, '0');
    const mi = String(fecha.getMinutes()).padStart(2, '0');
    const ss = String(fecha.getSeconds()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
  }

  private parsearTimestampSinTimezone(valor: string): Date {
    const limpio = valor.trim().replace('T', ' ').replace('Z', '');
    const [fechaParte, horaParte] = limpio.split(' ');

    if (!fechaParte || !horaParte) {
      return new Date(valor);
    }

    const [anio, mes, dia] = fechaParte.split('-').map(Number);
    const [hora, minuto, segundoConMs] = horaParte.split(':');

    if (!anio || !mes || !dia || hora === undefined || minuto === undefined || segundoConMs === undefined) {
      return new Date(valor);
    }

    const [segundo, milisegundo = '0'] = segundoConMs.split('.');

    return new Date(
      anio,
      mes - 1,
      dia,
      Number(hora),
      Number(minuto),
      Number(segundo),
      Number(milisegundo),
    );
  }

  private parsearFechaFiltroInicio(valor: string): Date {
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) {
      return this.parsearTimestampSinTimezone(`${valor.trim()}T00:00:00`);
    }

    return this.parsearTimestampSinTimezone(valor);
  }

  private parsearFechaFiltroFin(valor: string): Date {
    if (/^\d{4}-\d{2}-\d{2}$/.test(valor.trim())) {
      return this.parsearTimestampSinTimezone(`${valor.trim()}T23:59:59`);
    }

    return this.parsearTimestampSinTimezone(valor);
  }
}