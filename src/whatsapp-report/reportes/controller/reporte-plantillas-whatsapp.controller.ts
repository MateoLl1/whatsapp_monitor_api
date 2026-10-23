import { Controller, Get, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common'
import { ConsultarReportePlantillasDto } from '../dto/consultar-reporte-plantillas.dto'
import { ReportePlantillasWhatsappService } from '../services/reporte-plantillas-whatsapp.service'

// evolution-backend no registra un ValidationPipe global. Se aplica aquí para conservar
// el comportamiento original: valores por defecto del DTO y validación de ordenar_por/orden,
// que se interpolan en el ORDER BY (sin esta validación habría riesgo de inyección SQL).
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('reportes/plantillas-whatsapp')
export class ReportePlantillasWhatsappController {

  constructor(
    private readonly servicio: ReportePlantillasWhatsappService
  ) {}

  @Get()
  async consultar(@Query() dto: ConsultarReportePlantillasDto) {
    return this.servicio.consultar(dto)
  }

  @Get('chat/:numero')
  async obtenerChat(@Param('numero') numero: string) {
    return this.servicio.obtenerChatPorNumero(numero)
  }

  @Get(':id')
  async obtenerDetalle(@Param('id', ParseIntPipe) id: number) {
    return this.servicio.obtenerDetalle(id)
  }
}