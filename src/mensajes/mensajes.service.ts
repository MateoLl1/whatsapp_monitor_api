import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensaje)
    private mensajesRepo: Repository<Mensaje>,
  ) {}

  create(dto: CreateMensajeDto) {
    const mensaje = this.mensajesRepo.create(dto);
    return this.mensajesRepo.save(mensaje);
  }

  findAll() {
    return this.mensajesRepo.find({ relations: ['conversacion'] });
  }

  findOne(id: number) {
    return this.mensajesRepo.findOne({
      where: { id },
      relations: ['conversacion'],
    });
  }

  findByConversacion(conversacionId: number) {
    return this.mensajesRepo.find({
      where: { conversacion: { id: conversacionId } },
      relations: ['conversacion'],
      order: { timestamp: 'ASC' },
    });
  }

  update(id: number, dto: UpdateMensajeDto) {
    return this.mensajesRepo.update(id, dto);
  }

  remove(id: number) {
    return this.mensajesRepo.delete(id);
  }
}
