import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
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
      fecha: payload.date_time ? new Date(payload.date_time) : new Date(),
      asesor,
    });

    await this.asesorConexionesRepository.save(registro);
  }

  async obtenerResumen(fechaInicio?: string, fechaFin?: string) {
    const where = this.construirWhereFechas(fechaInicio, fechaFin);

    const [total, open, close, qrcode, removed] = await Promise.all([
      this.asesorConexionesRepository.count({ where }),
      this.asesorConexionesRepository.count({ where: { ...where, estado: 'open' } }),
      this.asesorConexionesRepository.count({ where: { ...where, estado: 'close' } }),
      this.asesorConexionesRepository.count({ where: { ...where, estado: 'qrcode' } }),
      this.asesorConexionesRepository.count({ where: { ...where, estado: 'removed' } }),
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
          ultima_actividad: item.fecha,
          estado_actual: item.estado,
        });
      }

      const actual = mapa.get(asesorId);

      if (item.estado === 'open') {
        actual.total_open += 1;
        if (!actual.ultima_conexion) {
          actual.ultima_conexion = item.fecha;
        }
      }

      if (item.estado === 'close') {
        actual.total_close += 1;
        if (!actual.ultima_desconexion) {
          actual.ultima_desconexion = item.fecha;
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
          fecha: item.fecha,
        });
      }
    }

    return Array.from(mapa.values()).sort((a, b) =>
      a.asesor_nombre.localeCompare(b.asesor_nombre),
    );
  }

  async obtenerTimelinePorAsesor(asesorId: number, fechaInicio?: string, fechaFin?: string) {
    const where: any = {
      asesor: { id: asesorId },
    };

    if (fechaInicio && fechaFin) {
      where.fecha = Between(new Date(fechaInicio), new Date(fechaFin));
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
      fecha: item.fecha,
    }));
  }

  private construirWhereFechas(fechaInicio?: string, fechaFin?: string) {
    if (fechaInicio && fechaFin) {
      return {
        fecha: Between(new Date(fechaInicio), new Date(fechaFin)),
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
}