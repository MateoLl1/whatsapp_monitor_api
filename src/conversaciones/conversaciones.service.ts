import { Injectable } from '@nestjs/common';
import { CreateConversacioneDto } from './dto/create-conversacione.dto';
import { UpdateConversacioneDto } from './dto/update-conversacione.dto';

@Injectable()
export class ConversacionesService {
  create(createConversacioneDto: CreateConversacioneDto) {
    return 'This action adds a new conversacione';
  }

  findAll() {
    return `This action returns all conversaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} conversacione`;
  }

  update(id: number, updateConversacioneDto: UpdateConversacioneDto) {
    return `This action updates a #${id} conversacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversacione`;
  }
}
