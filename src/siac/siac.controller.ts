import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SiacService } from './siac.service';
import { GetSiacMensajesDto } from './dto/get-siac-mensajes.dto';
import { GetSiacMensajesHistorialDto } from './dto/get-siac-mensajes-historial.dto';

@Controller('siac')
export class SiacController {
  constructor(private readonly siacService: SiacService) {}

  @Get('mensajes')
  obtenerMensajes(@Query() query: GetSiacMensajesDto) {
    return this.siacService.obtenerMensajes(query);
  }

  @Post('mensajes/historial')
  obtenerMensajesHistorial(@Body() body: GetSiacMensajesHistorialDto) {
    return this.siacService.obtenerMensajesHistorial(body);
  }
}