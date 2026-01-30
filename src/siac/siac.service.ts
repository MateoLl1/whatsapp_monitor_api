import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asesor } from '../asesores/entities/asesore.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { GetSiacMensajesDto } from './dto/get-siac-mensajes.dto';
import { TempLinksService } from '../media/services/temp-links.service';

@Injectable()
export class SiacService {
  constructor(
    @InjectRepository(Asesor)
    private readonly asesorRepo: Repository<Asesor>,
    @InjectRepository(Mensaje)
    private readonly mensajeRepo: Repository<Mensaje>,
    private tempLinksService: TempLinksService
  ) {}

  async obtenerMensajes(query: GetSiacMensajesDto) {
    const asesor = await this.asesorRepo.findOne({
      where: { nombre: query.asesor },
      select: ['id', 'nombre', 'numero_whatsapp'],
    });

    if (!asesor) throw new NotFoundException('Asesor no encontrado');

    const limit = query.limit ?? 500;

    const qb = this.mensajeRepo
      .createQueryBuilder('msg')
      .innerJoin('msg.conversacion', 'conv')
      .innerJoin('conv.asesor', 'asesor')
      .where('asesor.id = :asesorId', { asesorId: asesor.id })
      .andWhere('conv.cliente_numero = :cliente', { cliente: query.cliente })
      .select([
        "to_char(msg.fecha, 'YYYY-MM-DD HH24:MI:SS') as fecha",
        'msg.mensaje as mensaje',
        'msg.fromMe as fromMe',
        'msg.objeto as objeto',
      ])
      .orderBy('msg.fecha', 'ASC')
      .take(limit);

    if (query.after) {
      const afterDate = new Date(query.after);
      if (!isNaN(afterDate.getTime())) {
        qb.andWhere("(msg.fecha AT TIME ZONE 'America/Guayaquil') > :after", {
          after: afterDate.toISOString(),
        });
      }
    }

    const rows = await qb.getRawMany();

    const origin = (process.env.PUBLIC_ORIGIN || '').replace(/\/$/, '');
    if (!origin) throw new Error('PUBLIC_ORIGIN is required');

    const port = process.env.APP_PORT || '3000';
    const base =
      origin === 'http://localhost' || origin === 'http://127.0.0.1'
        ? `${origin}:${port}`
        : origin;

    const getNombreArchivo = (objeto: string) => {
      const clean = (objeto ?? '').toString().trim();
      if (!clean) return null;
      const parts = clean.split('/').filter(Boolean);
      return parts.length ? parts[parts.length - 1] : clean;
    };

    const nombresUnicos = Array.from(
      new Set(rows.map((r) => getNombreArchivo(r.objeto)).filter((x) => !!x)),
    ) as string[];

    const urls = nombresUnicos.map((name) => {
      const token = this.tempLinksService.create(name, 300, false);
      const url = `${base}/api/media/t/${token}`;
      return [name, url] as const;
    });

    const urlMap = new Map<string, string>(urls);

    return {
      asesor_nombre: asesor.nombre,
      asesor_numero: asesor.numero_whatsapp ?? '',
      cliente_numero: query.cliente,
      mensajes: rows.map((r) => {
        const objeto = r.objeto ?? null;
        const isFile = !!objeto;

        const adjuntoNombre = isFile ? getNombreArchivo(objeto) : null;

        return {
          fecha: r.fecha,
          mensaje: r.mensaje ?? '',
          fromMe: !!r.fromme,
          tipo_mensaje: isFile ? 'FILE' : 'TEXT',
          adjunto_nombre: adjuntoNombre,
          adjunto_url:
            isFile && adjuntoNombre
              ? (urlMap.get(adjuntoNombre) ?? null)
              : null,
        };
      }),
    };
  }
}
