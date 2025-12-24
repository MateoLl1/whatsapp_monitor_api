import { PartialType } from '@nestjs/mapped-types';
import { CreateConversacioneDto } from './create-conversacione.dto';

export class UpdateConversacioneDto extends PartialType(CreateConversacioneDto) {}
