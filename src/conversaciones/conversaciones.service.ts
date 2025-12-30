import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateConversacioneDto } from './dto/update-conversacion.dto';
import { Conversacion } from './entities/conversacion.entity';
import { CreateConversacionDto } from './dto/create-conversacion.dto';
import { Asesor } from '../asesores/entities/asesore.entity';

@Injectable()
export class ConversacionesService {
  constructor(
    @InjectRepository(Conversacion)
    private conversacionesRepo: Repository<Conversacion>,
    @InjectRepository(Asesor)
    private asesoresRepo: Repository<Asesor>,
  ) {}

  async create(dto: CreateConversacionDto) {
    const asesor = await this.asesoresRepo.findOneBy({ id: dto.co_asesor_id });
    if (!asesor) {
      throw new Error(`Asesor con id ${dto.co_asesor_id} no encontrado`);
    }
    const conversacion = this.conversacionesRepo.create({
      cliente_numero: dto.cliente_numero,
      nombre_cliente: dto.nombre_cliente,
      inicio: dto.inicio,
      fin: dto.fin,
      estado: dto.estado,
      asesor,
    });
    return this.conversacionesRepo.save(conversacion);
  }

  findAll() {
    return this.conversacionesRepo.find({ relations: ['asesor'] });
  }

  findOne(id: number) {
    return this.conversacionesRepo.findOne({
      where: { id },
      relations: ['asesor'],
    });
  }

  update(id: number, dto: UpdateConversacioneDto) {
    return this.conversacionesRepo.update(id, dto);
  }

  remove(id: number) {
    return this.conversacionesRepo.delete(id);
  }
}
