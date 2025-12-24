import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asesor } from './entities/asesore.entity';
import { CreateAsesorDto } from './dto/create-asesores.dto';
import { UpdateAsesorDto } from './dto/update-asesores.dto';

@Injectable()
export class AsesoresService {
  constructor(
    @InjectRepository(Asesor)
    private asesoresRepo: Repository<Asesor>,
  ) {}

  create(dto: CreateAsesorDto) {
    const asesor = this.asesoresRepo.create(dto);
    return this.asesoresRepo.save(asesor);
  }

  findAll() {
    return this.asesoresRepo.find();
  }

  findOne(id: number) {
    return this.asesoresRepo.findOneBy({ id });
  }

  update(id: number, dto: UpdateAsesorDto) {
    return this.asesoresRepo.update(id, dto);
  }

  remove(id: number) {
    return this.asesoresRepo.delete(id);
  }
}
