import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { Conversacion } from '../conversaciones/entities/conversacion.entity';
import { MessageService } from '../evolution/services/message.service';
import { MinioService } from '../files/minio.service';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensaje)
    private mensajesRepo: Repository<Mensaje>,
    @InjectRepository(Conversacion)
    private conversacionesRepo: Repository<Conversacion>,
    private messageService: MessageService,
    private minioService: MinioService,
  ) {}

  async create(dto: CreateMensajeDto) {
    const conversacion = await this.conversacionesRepo.findOne({
      where: { id: dto.conversacion?.id },
      relations: ['asesor'],
    });

    if (!conversacion) {
      throw new Error(`Conversación con id ${dto.me_conv_id} no encontrada`);
    }

    const instanceName = conversacion.asesor.nombre;
    const numeroCliente = conversacion.cliente_numero;

    if (!instanceName) {
      throw new Error(`El asesor no tiene instancia configurada`);
    }

    await this.messageService.sendTextMessage(
      instanceName,
      numeroCliente,
      dto.mensaje,
    );

    const mensaje: Mensaje = {
      id: Date.now(),
      conversacion,
      mensaje: dto.mensaje,
      fecha: dto.fecha ?? new Date(),
      fromMe: true,
    };

    return mensaje;
  }

  findAll() {
    return this.mensajesRepo.find({ relations: ['conversacion'] });
  }

  findOne(id: number) {
    return this.mensajesRepo.find({
      where: { id },
      relations: ['conversacion'],
    });
  }

  async findByConversacion(conversacionId: number) {
    const mensajes = await this.mensajesRepo.find({
      where: { conversacion: { id: conversacionId } },
      relations: ['conversacion'],
    });

    return Promise.all(
      mensajes.map(async (m) => {
        let url: string | null = null;
        let tipo: string | null = null;

        if (m.objeto) {
          url = await this.minioService.getFileUrl(m.objeto);

          if (m.objeto.endsWith('.ogg')) tipo = 'audio';
          else if (
            m.objeto.endsWith('.jpg') ||
            m.objeto.endsWith('.jpeg') ||
            m.objeto.endsWith('.png')
          )
            tipo = 'imagen';
          else if (m.objeto.endsWith('.webp')) tipo = 'sticker';
          else if (m.objeto.endsWith('.mp4')) tipo = 'video';
          else tipo = 'archivo';
        }

        return {
          id: m.id,
          mensaje: m.mensaje,
          fecha: m.fecha,
          fromMe: m.fromMe,
          objeto: url,
          tipo,
        };
      }),
    );
  }

  update(id: number, dto: UpdateMensajeDto) {
    return this.mensajesRepo.update(id, dto);
  }

  remove(id: number) {
    return this.mensajesRepo.delete(id);
  }
}
