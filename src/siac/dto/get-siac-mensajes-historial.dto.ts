import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class AsesorWhatsappProformaDto {
  @IsOptional()
  @IsString()
  UsNombre?: string;

  @IsOptional()
  @IsString()
  UsRuc?: string;

  @IsOptional()
  @IsString()
  TeNombre?: string;

  @IsOptional()
  @IsString()
  TeCelular?: string;
}

export class GetSiacMensajesHistorialDto {
  @IsString()
  cliente: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsesorWhatsappProformaDto)
  asesores: AsesorWhatsappProformaDto[];

  @IsOptional()
  @IsString()
  after?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(2000)
  limit?: number;
}