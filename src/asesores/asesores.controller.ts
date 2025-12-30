import { AsesoresService } from './asesores.service';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateAsesorDto } from './dto/create-asesor.dto';
import { UpdateAsesorDto } from './dto/update-asesor.dto';

@Controller('asesores')
export class AsesoresController {
  constructor(private readonly asesoresService: AsesoresService) {}

  @Post()
  create(@Body() dto: CreateAsesorDto) {
    return this.asesoresService.create(dto);
  }

  @Get()
  findAll() {
    return this.asesoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.asesoresService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAsesorDto) {
    return this.asesoresService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.asesoresService.remove(+id);
  }

  @Get(':id/connect')
  connect(@Param('id') id: string) {
    return this.asesoresService.connect(+id);
  }
}
