import { Controller, Get, Query } from '@nestjs/common';
import { SiacService } from './siac.service';
import { GetSiacMensajesDto } from './dto/get-siac-mensajes.dto';

@Controller('siac')
export class SiacController {
  constructor(private readonly siacService: SiacService) {}

  @Get('mensajes')
  obtenerMensajes(@Query() query: GetSiacMensajesDto) {
    return this.siacService.obtenerMensajes(query);
  }
}
