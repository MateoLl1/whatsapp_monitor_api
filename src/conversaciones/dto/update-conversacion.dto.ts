import { PartialType } from '@nestjs/mapped-types';
import { CreateConversacionDto } from './create-conversacion.dto';

export class UpdateConversacioneDto extends PartialType(CreateConversacionDto) {}
