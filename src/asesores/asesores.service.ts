import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Brackets, Repository } from 'typeorm';
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

  private limpiarDigitos(valor?: string): string {
    return (valor || '').replace(/\D/g, '').trim();
  }

  private normalizarNumeroEcuador(valor?: string): string | null {
    const digits = this.limpiarDigitos(valor);

    if (!digits) return null;

    if (digits.startsWith('593') && digits.length >= 11) return digits;

    if (digits.startsWith('0') && digits.length >= 10) {
      return '593' + digits.substring(1);
    }

    if (digits.length === 9) {
      return '593' + digits;
    }

    return digits.length >= 11 ? digits : null;
  }

  private normalizarRuc(valor?: string): string | null {
    const digits = this.limpiarDigitos(valor);
    return digits ? digits : null;
  }

  private obtenerNumerosNormalizados(numeros?: string[]): string[] {
    return [...new Set((numeros || [])
      .map((x) => this.normalizarNumeroEcuador(x))
      .filter((x): x is string => !!x))];
  }

  private obtenerRucsNormalizados(rucs?: string[]): string[] {
    return [...new Set((rucs || [])
      .map((x) => this.normalizarRuc(x))
      .filter((x): x is string => !!x))];
  }

  async create(dto: CreateAsesorDto) {
    const existente = await this.asesoresRepo.findOne({
      where: { nombre: dto.nombre },
    });

    if (existente) {
      try {
        await this.instanceService.getConnectionState(existente.nombre);
        throw new ConflictException(
          `Ya existe un asesor con el nombre "${dto.nombre}"`,
        );
      } catch (error: any) {
        if (error.status === 404) {
          await this.instanceService.createInstance(existente.nombre);
          return existente;
        }
        throw error;
      }
    }

    const asesor = this.asesoresRepo.create(dto);
    const saved = await this.asesoresRepo.save(asesor);
    await this.instanceService.createInstance(saved.nombre);
    return saved;
  }

  async findByNumeroOrRuc(numeros?: string[], rucs?: string[]) {
    const numerosNormalizados = this.obtenerNumerosNormalizados(numeros);
    const rucsNormalizados = this.obtenerRucsNormalizados(rucs);

    if (numerosNormalizados.length === 0 && rucsNormalizados.length === 0) {
      return [];
    }

    const qb = this.asesoresRepo.createQueryBuilder('asesor');

    qb.where(
      new Brackets((subQb) => {
        let agregado = false;

        if (numerosNormalizados.length > 0) {
          subQb.where('asesor.numero_whatsapp IN (:...numeros)', {
            numeros: numerosNormalizados,
          });
          agregado = true;
        }

        if (rucsNormalizados.length > 0) {
          if (agregado) {
            subQb.orWhere('asesor.ruc_tecnico IN (:...rucs)', {
              rucs: rucsNormalizados,
            });
          } else {
            subQb.where('asesor.ruc_tecnico IN (:...rucs)', {
              rucs: rucsNormalizados,
            });
          }
        }
      }),
    );

    return qb.getMany();
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

  async getStats(numeros?: string[], rucs?: string[]) {
    const numerosNormalizados = this.obtenerNumerosNormalizados(numeros);
    const rucsNormalizados = this.obtenerRucsNormalizados(rucs);

    let asesores: Asesor[] = [];

    if (numerosNormalizados.length === 0 && rucsNormalizados.length === 0) {
      asesores = await this.asesoresRepo.find();
    } else {
      const qb = this.asesoresRepo.createQueryBuilder('asesor');

      qb.where(
        new Brackets((subQb) => {
          let agregado = false;

          if (numerosNormalizados.length > 0) {
            subQb.where('asesor.numero_whatsapp IN (:...numeros)', {
              numeros: numerosNormalizados,
            });
            agregado = true;
          }

          if (rucsNormalizados.length > 0) {
            if (agregado) {
              subQb.orWhere('asesor.ruc_tecnico IN (:...rucs)', {
                rucs: rucsNormalizados,
              });
            } else {
              subQb.where('asesor.ruc_tecnico IN (:...rucs)', {
                rucs: rucsNormalizados,
              });
            }
          }
        }),
      );

      asesores = await qb.getMany();
    }

    const asesorIds = asesores.map((x) => x.id);
    const total = asesores.length;
    const conectados = asesores.filter((a) => a.activo).length;
    const desconectados = total - conectados;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    let mensajesHoy = 0;

    if (asesorIds.length > 0) {
      mensajesHoy = await this.mensajesRepo
        .createQueryBuilder('mensaje')
        .leftJoin('mensaje.conversacion', 'conversacion')
        .leftJoin('conversacion.asesor', 'asesor')
        .where('mensaje.fecha >= :hoy AND mensaje.fecha < :manana', {
          hoy,
          manana,
        })
        .andWhere('asesor.id IN (:...asesorIds)', { asesorIds })
        .getCount();
    }

    return { asesores: total, conectados, desconectados, mensajesHoy };
  }
}