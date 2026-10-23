import { Transform } from 'class-transformer'
import { IsEnum, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { EstadoMensajeWhatsappEnum } from '../enums/estado-mensaje-whatsapp.enum'

export class ConsultarReportePlantillasDto {

  @IsOptional()
  @IsString()
  busqueda?: string

  @IsOptional()
  @IsString()
  id_plantilla?: string

  @IsOptional()
  @IsString()
  nombre_plantilla?: string

  @IsOptional()
  @IsEnum(EstadoMensajeWhatsappEnum)
  estado?: EstadoMensajeWhatsappEnum

  @IsOptional()
  @IsString()
  fecha_desde?: string

  @IsOptional()
  @IsString()
  fecha_hasta?: string

  @IsOptional()
  @IsString()
  hora_desde?: string

  @IsOptional()
  @IsString()
  hora_hasta?: string

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  pagina: number = 1

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(200)
  limite: number = 25

  @IsOptional()
  @IsString()
  @IsIn(['RPW_FECHA', 'RPW_HORA', 'RPW_NOMBRE', 'RPW_NUMERO', 'RPW_ESTADO', 'RPW_NOMBRE_PLANTILLA', 'RPW_ID_PLANTILLA'])
  ordenar_por: string = 'RPW_FECHA'

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  orden: string = 'DESC'
}