import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { Conversacion } from '../conversaciones/entities/conversacion.entity';
import { EvolutionService } from '../evolution/evolution.service';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensaje)
    private mensajesRepo: Repository<Mensaje>,
    @InjectRepository(Conversacion)
    private conversacionesRepo: Repository<Conversacion>,
    private evolutionService: EvolutionService,
  ) {}

  async create(dto: CreateMensajeDto) {
    const conversacion = await this.conversacionesRepo.findOne({
      where: { id: dto.conversacion?.id },
      relations: ['asesor'],
    });
    if (!conversacion) {
      throw new Error(`Conversación con id ${dto.me_conv_id} no encontrada`);
    }

    const mensaje = this.mensajesRepo.create({
      mensaje: dto.mensaje,
      fecha: dto.fecha ?? new Date(),
      fromMe: dto.fromMe,
      conversacion,
    });
    const saved = await this.mensajesRepo.save(mensaje);

    if (dto.fromMe) {
      const instanceName = conversacion.asesor.nombre;
      const numeroCliente = conversacion.cliente_numero;
      if (!instanceName) {
        throw new Error(`El asesor no tiene instancia configurada`);
      }

      await this.evolutionService.sendTextMessage(
        instanceName,
        numeroCliente,
        dto.mensaje,
      );
    }

    return saved;
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
