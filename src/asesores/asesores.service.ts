import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Asesor } from './entities/asesore.entity';
import { CreateAsesorDto } from './dto/create-asesor.dto';
import { EvolutionService } from '../evolution/evolution.service';
import { UpdateAsesorDto } from './dto/update-asesor.dto';
import { Mensaje } from '../mensajes/entities/mensaje.entity';

@Injectable()
export class AsesoresService {
  constructor(
    @InjectRepository(Asesor)
    private asesoresRepo: Repository<Asesor>,
    @InjectRepository(Mensaje)
    private mensajesRepo: Repository<Mensaje>,
    private readonly evolutionService: EvolutionService,
  ) {}

  async create(dto: CreateAsesorDto) {
    const asesor = this.asesoresRepo.create(dto);
    const saved = await this.asesoresRepo.save(asesor);
    await this.evolutionService.createInstance(saved.nombre);
    return saved;
  }

  async findAll() {
    const asesores = await this.asesoresRepo.find();
    const instances = await this.evolutionService.fetchInstances();

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
      await this.evolutionService.deleteInstance(asesor.nombre);
    }
    return this.asesoresRepo.delete(id);
  }
  async connect(id: number) {
    const asesor = await this.findOne(id);
    if (!asesor) {
      throw new Error('Asesor no encontrado');
    }
    return this.evolutionService.connectInstance(asesor.nombre);
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
