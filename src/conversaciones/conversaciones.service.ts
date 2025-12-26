import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConversacioneDto } from './dto/create-conversacione.dto';
import { UpdateConversacioneDto } from './dto/update-conversacione.dto';
import { Conversacion } from './entities/conversacion.entity';

@Injectable()
export class ConversacionesService {
  constructor(
    @InjectRepository(Conversacion)
    private conversacionesRepo: Repository<Conversacion>,
  ) {}

  create(dto: CreateConversacioneDto) {
    const conversacion = this.conversacionesRepo.create(dto);
    return this.conversacionesRepo.save(conversacion);
  }

  findAll() {
    return this.conversacionesRepo.find({ relations: ['asesor'] });
  }

  findOne(id: number) {
    return this.conversacionesRepo.findOne({
      where: { id },
      relations: ['asesor'],
    });
  }

  update(id: number, dto: UpdateConversacioneDto) {
    return this.conversacionesRepo.update(id, dto);
  }

  remove(id: number) {
    return this.conversacionesRepo.delete(id);
  }
}
