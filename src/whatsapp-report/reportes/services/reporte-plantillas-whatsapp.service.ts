import { Injectable, NotFoundException } from '@nestjs/common'
import { ConsultarReportePlantillasDto } from '../dto/consultar-reporte-plantillas.dto'
import { ReportePlantillasWhatsappRepositorio } from '../repositorios/reporte-plantillas-whatsapp.repositorio'

@Injectable()
export class ReportePlantillasWhatsappService {

  constructor(
    private readonly repositorio: ReportePlantillasWhatsappRepositorio
  ) {}

  async consultar(dto: ConsultarReportePlantillasDto) {
    return this.repositorio.consultar(dto)
  }

  async obtenerDetalle(id: number) {
    const registro = await this.repositorio.buscarPorId(id)
    if (!registro) throw new NotFoundException('Registro no encontrado')
    return registro
  }

  async obtenerChatPorNumero(numero: string) {
    const datos = await this.repositorio.consultarChatPorNumero(numero)
    if (!datos.length) throw new NotFoundException('No existen registros para el número')
    return datos
  }
}