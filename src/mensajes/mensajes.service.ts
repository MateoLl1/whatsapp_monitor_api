import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mensaje } from './entities/mensaje.entity';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { UpdateMensajeDto } from './dto/update-mensaje.dto';
import { Conversacion } from '../conversaciones/entities/conversacion.entity';
import { MessageService } from '../evolution/services/message.service';
import { MinioService } from '../files/minio.service';
import { TempLinksService } from '../media/services/temp-links.service';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensaje)
    private mensajesRepo: Repository<Mensaje>,
    @InjectRepository(Conversacion)
    private conversacionesRepo: Repository<Conversacion>,
    private messageService: MessageService,
    private tempLinksService: TempLinksService,
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

    const origin = (process.env.PUBLIC_ORIGIN || '').replace(/\/$/, '');
    if (!origin) throw new Error('PUBLIC_ORIGIN is required');

    const port = process.env.APP_PORT || '3000';

    const base =
      origin === 'http://localhost' || origin === 'http://127.0.0.1'
        ? `${origin}:${port}`
        : origin;

    return Promise.all(
      mensajes.map(async (m) => {
        let url: string | null = null;
        let tipo: string | null = null;

        if (m.objeto) {
          const objectName = m.objeto.includes('/api/')
            ? (m.objeto.split('/').pop() ?? m.objeto)
            : m.objeto;

          const token = this.tempLinksService.create(objectName, 300, false);
          url = `${base}/api/media/t/${token}`;

          if (objectName.endsWith('.ogg')) tipo = 'audio';
          else if (
            objectName.endsWith('.jpg') ||
            objectName.endsWith('.jpeg') ||
            objectName.endsWith('.png')
          )
            tipo = 'imagen';
          else if (objectName.endsWith('.webp')) tipo = 'sticker';
          else if (objectName.endsWith('.mp4')) tipo = 'video';
          else tipo = 'archivo';
        }

        return {
          id: m.id,
          mensaje: m.mensaje,
          fecha: m.fecha,
          fromMe: m.fromMe,
          objeto: url,
          tipo,
          conversacion: m.conversacion,
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
