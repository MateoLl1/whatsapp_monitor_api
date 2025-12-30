export class CreateMensajeDto {
  me_conv_id: number;
  mensaje: string;
  fecha: Date;           
  fromMe: boolean;
  conversacion: { id: number };
}
