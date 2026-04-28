import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Asesor } from '../asesores/entities/asesore.entity';
import { Mensaje } from '../mensajes/entities/mensaje.entity';
import { GetSiacMensajesDto } from './dto/get-siac-mensajes.dto';
import { GetSiacMensajesHistorialDto } from './dto/get-siac-mensajes-historial.dto';
import { MediaUrlService } from '../media/services/media-url.service';

@Injectable()
export class SiacService {
  constructor(
    @InjectRepository(Asesor)
    private readonly asesorRepo: Repository<Asesor>,
    @InjectRepository(Mensaje)
    private readonly mensajeRepo: Repository<Mensaje>,
    private readonly mediaUrl: MediaUrlService,
  ) {}

  async obtenerMensajes(query: GetSiacMensajesDto) {
    const asesor = await this.asesorRepo.findOne({
      where: { nombre: query.asesor },
      select: ['id', 'nombre', 'numero_whatsapp', 'ruc_tecnico'],
    });

    if (!asesor) throw new NotFoundException('Asesor no encontrado');

    return this.obtenerMensajesPorAsesores({
      cliente: query.cliente,
      asesores: [asesor],
      after: query.after,
      limit: query.limit,
    });
  }

  async obtenerMensajesHistorial(body: GetSiacMensajesHistorialDto) {
    const clienteNormalizado = this.normalizarTelefonoEcuador(body.cliente);

    if (!clienteNormalizado) {
      throw new NotFoundException('Cliente inválido');
    }

    const rucs = Array.from(
      new Set(
        (body.asesores ?? [])
          .map((x) => this.normalizarIdentificacion(x.UsRuc))
          .filter((x): x is string => !!x),
      ),
    );

    const numeros = Array.from(
      new Set(
        (body.asesores ?? [])
          .map((x) => this.normalizarTelefonoEcuador(x.TeCelular))
          .filter((x): x is string => !!x),
      ),
    );

    if (rucs.length === 0 && numeros.length === 0) {
      throw new NotFoundException('No existen asesores válidos');
    }

    const asesores = await this.buscarAsesoresPorRucONumero(rucs, numeros);

    if (asesores.length === 0) {
      throw new NotFoundException('No se encontraron asesores en WhatsApp');
    }

    return this.obtenerMensajesPorAsesores({
      cliente: clienteNormalizado,
      asesores,
      after: body.after,
      limit: body.limit,
    });
  }

  private async buscarAsesoresPorRucONumero(rucs: string[], numeros: string[]) {
    const candidatos = await this.asesorRepo.find({
      select: ['id', 'nombre', 'numero_whatsapp', 'ruc_tecnico'],
      where: rucs.length > 0 ? [{ ruc_tecnico: In(rucs) }] : [],
    });

    let asesores = candidatos;

    if (numeros.length > 0) {
      const todosConNumero = await this.asesorRepo
        .createQueryBuilder('asesor')
        .select([
          'asesor.id',
          'asesor.nombre',
          'asesor.numero_whatsapp',
          'asesor.ruc_tecnico',
        ])
        .where('asesor.numero_whatsapp IS NOT NULL')
        .getMany();

      const setNumeros = new Set(numeros);

      const porNumero = todosConNumero.filter((a) => {
        const n = this.normalizarTelefonoEcuador(a.numero_whatsapp);
        return !!n && setNumeros.has(n);
      });

      const map = new Map<number, Asesor>();

      for (const a of asesores) {
        map.set(a.id, a);
      }

      for (const a of porNumero) {
        map.set(a.id, a);
      }

      asesores = Array.from(map.values());
    }

    return asesores;
  }

  private async obtenerMensajesPorAsesores(params: {
    cliente: string;
    asesores: Asesor[];
    after?: string;
    limit?: number;
  }) {
    const asesorIds = params.asesores.map((x) => x.id);
    const limit = params.limit ?? 500;

    const qb = this.mensajeRepo
      .createQueryBuilder('msg')
      .innerJoin('msg.conversacion', 'conv')
      .innerJoin('conv.asesor', 'asesor')
      .where('asesor.id IN (:...asesorIds)', { asesorIds })
      .andWhere('conv.cliente_numero = :cliente', { cliente: params.cliente })
      .select("to_char(msg.fecha, 'YYYY-MM-DD HH24:MI:SS')", 'fecha')
      .addSelect('msg.mensaje', 'mensaje')
      .addSelect('msg.fromMe', 'fromMe')
      .addSelect('msg.objeto', 'objeto')
      .addSelect('asesor.nombre', 'asesor_nombre')
      .addSelect('asesor.numero_whatsapp', 'asesor_numero')
      .addSelect('asesor.ruc_tecnico', 'asesor_ruc')
      .orderBy('msg.fecha', 'ASC')
      .take(limit);

    if (params.after) {
      const afterDate = new Date(params.after);
      if (!isNaN(afterDate.getTime())) {
        qb.andWhere("(msg.fecha AT TIME ZONE 'America/Guayaquil') > :after", {
          after: afterDate.toISOString(),
        });
      }
    }

    const rows = await qb.getRawMany();

    const getNombreArchivo = (objeto: string) => this.mediaUrl.objectNameFrom(objeto);

    const nombresUnicos = Array.from(
      new Set(rows.map((r) => getNombreArchivo(r.objeto)).filter((x) => !!x)),
    ) as string[];

    const urls = nombresUnicos.map((name) => {
      const url = this.mediaUrl.tempUrlForObjectName(name, false);
      return [name, url] as const;
    });

    const urlMap = new Map<string, string>(urls);

    const primerAsesor = params.asesores[0];

    return {
      asesor_nombre: primerAsesor?.nombre ?? '',
      asesor_numero: primerAsesor?.numero_whatsapp ?? '',
      cliente_numero: params.cliente,
      mensajes: rows.map((r) => {
        const objeto = r.objeto ?? null;
        const isFile = !!objeto;
        const adjuntoNombre = isFile ? getNombreArchivo(objeto) : null;

        return {
          fecha: r.fecha,
          asesor_nombre: r.asesor_nombre ?? '',
          asesor_numero: r.asesor_numero ?? '',
          asesor_ruc: r.asesor_ruc ?? '',
          mensaje: r.mensaje ?? '',
          fromMe: !!(r.fromMe ?? r.fromme),
          tipo_mensaje: isFile ? 'FILE' : 'TEXT',
          adjunto_nombre: adjuntoNombre,
          adjunto_url:
            isFile && adjuntoNombre ? (urlMap.get(adjuntoNombre) ?? null) : null,
        };
      }),
    };
  }

  private normalizarIdentificacion(value?: string | null) {
    const digits = (value ?? '').replace(/\D/g, '').trim();
    return digits || null;
  }

  private normalizarTelefonoEcuador(value?: string | null) {
    let digits = (value ?? '').replace(/\D/g, '').trim();

    if (!digits) return null;

    if (digits.startsWith('593')) {
      digits = digits.substring(3);
    }

    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    if (digits.length === 9 && digits.startsWith('9')) {
      return `593${digits}`;
    }

    if (digits.length === 8) {
      return `593${digits}`;
    }

    if (digits.length > 9) {
      const last9 = digits.substring(digits.length - 9);
      if (last9.startsWith('9')) {
        return `593${last9}`;
      }

      const last8 = digits.substring(digits.length - 8);
      return `593${last8}`;
    }

    return null;
  }
}