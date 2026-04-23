import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateAsesorDto } from './dto/create-asesor.dto';
import { UpdateAsesorDto } from './dto/update-asesor.dto';
import { Asesor } from './entities/asesore.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';

@Injectable()
export class AsesoresService {
  constructor(
    @InjectRepository(Asesor)
    private readonly asesoresRepository: Repository<Asesor>,
    @InjectRepository(Mensaje)
    private readonly mensajesRepository: Repository<Mensaje>,
  ) {}

  create(dto: CreateAsesorDto) {
    const asesor = this.asesoresRepository.create(dto);
    return this.asesoresRepository.save(asesor);
  }

  findAll() {
    return this.asesoresRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const asesor = await this.asesoresRepository.findOne({
      where: { id },
    });

    if (!asesor) {
      throw new NotFoundException('Asesor no encontrado');
    }

    return asesor;
  }

  async update(id: number, dto: UpdateAsesorDto) {
    const asesor = await this.findOne(id);
    Object.assign(asesor, dto);
    return this.asesoresRepository.save(asesor);
  }

  async remove(id: number) {
    const asesor = await this.findOne(id);
    return this.asesoresRepository.remove(asesor);
  }

  async connect(id: string) {
    const asesor = await this.findOne(+id);
    return {
      ok: true,
      asesor,
    };
  }

  async findByNumeroOrRuc(numeros?: string[], rucs?: string[]) {
    const where: any[] = [];

    if (numeros?.length) {
      where.push({ numero_whatsapp: In(numeros) });
    }

    if (rucs?.length) {
      where.push({ ruc_tecnico: In(rucs) });
    }

    if (!where.length) {
      return this.asesoresRepository.find({
        order: {
          id: 'DESC',
        },
      });
    }

    return this.asesoresRepository.find({
      where,
      order: {
        id: 'DESC',
      },
    });
  }

  async getStats(numeros?: string[], rucs?: string[]) {
    let asesores: Asesor[];

    const where: any[] = [];

    if (numeros?.length) {
      where.push({ numero_whatsapp: In(numeros) });
    }

    if (rucs?.length) {
      where.push({ ruc_tecnico: In(rucs) });
    }

    if (where.length) {
      asesores = await this.asesoresRepository.find({
        where,
        relations: {
          conversaciones: true,
        },
      });
    } else {
      asesores = await this.asesoresRepository.find({
        relations: {
          conversaciones: true,
        },
      });
    }

    return asesores.map((asesor) => ({
      id: asesor.id,
      nombre: asesor.nombre,
      numero: asesor.numero_whatsapp,
      ruc: asesor.ruc_tecnico,
      total_conversaciones: asesor.conversaciones?.length ?? 0,
    }));
  }

  async getAllStats() {
    const asesores = await this.asesoresRepository.find();

    const asesoresTotal = asesores.length;
    const conectados = asesores.filter((asesor) => asesor.activo).length;
    const desconectados = asesoresTotal - conectados;

    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    const mensajesHoy = await this.mensajesRepository
      .createQueryBuilder('mensaje')
      .where('mensaje.fecha >= :inicioHoy', { inicioHoy })
      .andWhere('mensaje.fecha <= :finHoy', { finHoy })
      .getCount();

    return {
      asesores: asesoresTotal,
      conectados,
      desconectados,
      mensajesHoy,
    };
  }
}
