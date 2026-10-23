import { Controller, Get, Param } from '@nestjs/common'
import { CallbellService } from './callbell.service'

@Controller('callbell')
export class CallbellController {

  constructor(private readonly service: CallbellService) {}

  @Get('plantillas/:uuid')
  obtenerPlantilla(@Param('uuid') uuid: string) {
    return this.service.obtenerPlantillaPorUuid(uuid)
  }
}