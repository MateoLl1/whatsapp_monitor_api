import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Asesor } from './entities/asesore.entity';
import { CreateAsesorDto } from './dto/create-asesor.dto';
import { UpdateAsesorDto } from './dto/update-asesor.dto';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { InstanceService } from '../evolution/services/instance.service';

@Injectable()
export class AsesoresService {
  constructor(
    @InjectRepository(Asesor)
    private asesoresRepo: Repository<Asesor>,
    @InjectRepository(Mensaje)
    private mensajesRepo: Repository<Mensaje>,
    private readonly instanceService: InstanceService,
  ) {}

  async create(dto: CreateAsesorDto) {
    const existente = await this.asesoresRepo.findOne({
      where: { nombre: dto.nombre },
    });

    if (existente) {
      // Verificar si la instancia Evolution existe
      try {
        await this.instanceService.getConnectionState(existente.nombre);
        // Si no lanza error, la instancia sí existe → conflicto real
        throw new ConflictException(
          `Ya existe un asesor con el nombre "${dto.nombre}"`,
        );
      } catch (error: any) {
        // Si el error es 404 → la instancia no existe, recrearla
        if (error.status === 404) {
          await this.instanceService.createInstance(existente.nombre);
          return existente;
        }
        // Otros errores → propagar
        throw error;
      }
    }

    // Caso normal: crear asesor nuevo
    const asesor = this.asesoresRepo.create(dto);
    const saved = await this.asesoresRepo.save(asesor);
    await this.instanceService.createInstance(saved.nombre);
    return saved;
  }

  async findAll() {
    const asesores = await this.asesoresRepo.find();
    const instances = await this.instanceService.fetchInstances();

    return asesores.map((asesor) => {
      const instance = instances.find((i: any) => i.name === asesor.nombre);
      return {
        ...asesor,
        estado: instance?.connectionStatus === 'open' ? 'activo' : 'inactivo',
        instancia: instance?.id || null,
      };
    });
  }

  findOne(id: number) {
    return this.asesoresRepo.findOneBy({ id });
  }

  update(id: number, dto: UpdateAsesorDto) {
    return this.asesoresRepo.update(id, dto);
  }

  async remove(id: number) {
    const asesor = await this.findOne(id);
    if (asesor) {
      await this.instanceService.deleteInstance(asesor.nombre);
    }
    return this.asesoresRepo.delete(id);
  }

  async connect(idOrNombre: string) {
    let asesor;
    const id = Number(idOrNombre);

    if (!isNaN(id)) {
      asesor = await this.findOne(id);
    } else {
      asesor = await this.asesoresRepo.findOne({
        where: { nombre: idOrNombre },
      });
    }

    if (!asesor) {
      throw new NotFoundException('Asesor no encontrado');
    }

    return this.instanceService.connectInstance(asesor.nombre);
  }

  async getStats() {
    const asesores = await this.asesoresRepo.find();
    const total = asesores.length;
    const conectados = asesores.filter((a) => a.activo).length;
    const desconectados = total - conectados;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    const mensajesHoy = await this.mensajesRepo.count({
      where: { fecha: Between(hoy, mañana) },
    });
    return { asesores: total, conectados, desconectados, mensajesHoy };
  }
}
