import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { Conversacion } from '../conversaciones/entities/conversacion.entity';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensaje)
    private mensajesRepo: Repository<Mensaje>,
    @InjectRepository(Conversacion)
    private conversacionesRepo: Repository<Conversacion>,
  ) {}

  async create(dto: CreateMensajeDto) {
    const conversacion = await this.conversacionesRepo.findOneBy({
      id: dto.me_conv_id,
    });
    if (!conversacion) {
      throw new Error(`Conversación con id ${dto.me_conv_id} no encontrada`);
    }
    const mensaje = this.mensajesRepo.create({
      mensaje: dto.mensaje,
      fecha: dto.fecha,
      fromMe: dto.fromMe,
      conversacion,
    });
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
    });
  }

  update(id: number, dto: UpdateMensajeDto) {
    return this.mensajesRepo.update(id, dto);
  }

  remove(id: number) {
    return this.mensajesRepo.delete(id);
  }
}
