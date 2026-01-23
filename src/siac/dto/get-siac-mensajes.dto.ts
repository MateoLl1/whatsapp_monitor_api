import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetSiacMensajesDto {
  @IsString()
  asesor: string;

  @IsString()
  cliente: string;

  @IsOptional()
  @IsString()
  after?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  @Max(2000)
  limit?: number;
}
