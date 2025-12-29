export class CreateMensajeDto {
  conversacionId: number;
  mensaje: string;
  timestamp: Date;
  fromMe: boolean;
}
