import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { ConversacionesService } from './conversaciones.service';
import { UpdateConversacioneDto } from './dto/update-conversacion.dto';
import { CreateConversacionDto } from './dto/create-conversacion.dto';

@Controller('conversaciones')
export class ConversacionesController {
  constructor(private readonly conversacionesService: ConversacionesService) {}

  @Post()
  create(@Body() createConversacioneDto: CreateConversacionDto) {
    return this.conversacionesService.create(createConversacioneDto);
  }

  @Get()
  findAllByAsesor(
    @Query('asesorId') asesorId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('nombre') nombre?: string,
    @Query('numero') numero?: string,
  ) {
    const id = Number(asesorId);

    if (!asesorId || Number.isNaN(id) || id <= 0) {
      throw new BadRequestException('asesorId es obligatorio');
    }

    return this.conversacionesService.findAllByAsesor(
      id,
      fechaInicio,
      fechaFin,
      nombre,
      numero,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConversacioneDto: UpdateConversacioneDto) {
    return this.conversacionesService.update(+id, updateConversacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.conversacionesService.remove(+id);
  }
}