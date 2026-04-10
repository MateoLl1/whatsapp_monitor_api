import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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