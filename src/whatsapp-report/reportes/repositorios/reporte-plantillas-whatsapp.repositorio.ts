import { Injectable } from '@nestjs/common'
import { Brackets, Repository } from 'typeorm'
import { ReportePlantillaWhatsappEntity } from '../entidades/reporte-plantilla-whatsapp.entidad'
import { ConsultarReportePlantillasDto } from '../dto/consultar-reporte-plantillas.dto'
import { WhatsappReportDatabaseService } from '../../database/whatsapp-report-database.service'

@Injectable()
export class ReportePlantillasWhatsappRepositorio {

  constructor(
    private readonly baseDatos: WhatsappReportDatabaseService
  ) {}

  // Se obtiene en cada llamada: la conexión SQL Server puede no estar lista al arrancar
  private obtenerRepositorio(): Promise<Repository<ReportePlantillaWhatsappEntity>> {
    return this.baseDatos.obtenerRepositorio(ReportePlantillaWhatsappEntity)
  }

  async consultar(dto: ConsultarReportePlantillasDto) {
    const pagina = dto.pagina ?? 1
    const limite = dto.limite ?? 25
    const salto = (pagina - 1) * limite

    const repositorio = await this.obtenerRepositorio()
    const qb = repositorio.createQueryBuilder('r')

    if (dto.busqueda) {
      const texto = dto.busqueda.trim()
      qb.andWhere(
        new Brackets((q) => {
          q.where('r.RPW_NOMBRE LIKE :texto', { texto: `%${texto}%` })
            .orWhere('r.RPW_NUMERO LIKE :texto', { texto: `%${texto}%` })
        })
      )
    }

    if (dto.id_plantilla) {
      qb.andWhere('r.RPW_ID_PLANTILLA = :id_plantilla', { id_plantilla: dto.id_plantilla })
    }

    if (dto.nombre_plantilla) {
      qb.andWhere('r.RPW_NOMBRE_PLANTILLA LIKE :nombre_plantilla', { nombre_plantilla: `%${dto.nombre_plantilla}%` })
    }

    if (dto.estado) {
      qb.andWhere('r.RPW_ESTADO = :estado', { estado: dto.estado })
    }

    if (dto.fecha_desde) {
      qb.andWhere('r.RPW_FECHA >= :fecha_desde', { fecha_desde: dto.fecha_desde })
    }

    if (dto.fecha_hasta) {
      qb.andWhere('r.RPW_FECHA <= :fecha_hasta', { fecha_hasta: dto.fecha_hasta })
    }

    if (dto.hora_desde) {
      qb.andWhere('r.RPW_HORA >= :hora_desde', { hora_desde: dto.hora_desde })
    }

    if (dto.hora_hasta) {
      qb.andWhere('r.RPW_HORA <= :hora_hasta', { hora_hasta: dto.hora_hasta })
    }

    qb.orderBy(`r.${dto.ordenar_por}`, dto.orden as 'ASC' | 'DESC')
    qb.skip(salto).take(limite)

    const [datos, total] = await qb.getManyAndCount()
    return { datos, total, pagina, limite }
  }

  async buscarPorId(id: number) {
    const repositorio = await this.obtenerRepositorio()
    return repositorio.findOne({ where: { rpw_id: id } })
  }

  async consultarChatPorNumero(numero: string) {
    const repositorio = await this.obtenerRepositorio()
    return repositorio
      .createQueryBuilder('r')
      .where('r.RPW_NUMERO = :numero', { numero })
      .orderBy('r.RPW_FECHA', 'ASC')
      .addOrderBy('r.RPW_HORA', 'ASC')
      .getMany()
  }
}