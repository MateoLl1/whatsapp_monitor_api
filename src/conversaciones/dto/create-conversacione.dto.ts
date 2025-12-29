export class CreateConversacioneDto {
  cliente_numero: string;
  asesorId: number;
  inicio?: Date;
  fin?: Date;
  estado?: string;
  nombre_cliente?: string;
}
