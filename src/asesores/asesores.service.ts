import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asesor } from './entities/asesore.entity';
import { CreateAsesorDto } from './dto/create-asesores.dto';
import { EvolutionService } from '../evolution/evolution.service';
import { UpdateAsesorDto } from './dto/update-asesores.dto';

@Injectable()
export class AsesoresService {
  constructor(
    @InjectRepository(Asesor)
    private asesoresRepo: Repository<Asesor>,
    private readonly evolutionService: EvolutionService,
  ) {}

  async create(dto: CreateAsesorDto) {
    const asesor = this.asesoresRepo.create(dto);
    const saved = await this.asesoresRepo.save(asesor);
    await this.evolutionService.createInstance(
      saved.nombre,
      process.env.WEBHOOK_N8N_SEGUIMIENTO!,
    );
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
}
