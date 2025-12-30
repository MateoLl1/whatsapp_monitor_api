export class CreateConversacionDto {
  cliente_numero: string;
  co_asesor_id: number; 
  inicio?: Date;
  fin?: Date;
  estado?: string;
  nombre_cliente?: string;
}
