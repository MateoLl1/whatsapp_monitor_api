import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Conversacion } from '../../conversaciones/entities/conversacion.entity';

@Entity({ name: 'mensajes' })
export class Mensaje {
  @PrimaryGeneratedColumn({ name: 'me_id' })
  id: number;

  @Column({ name: 'me_mensajes', type: 'text' })
  mensaje: string;

  @Column({ name: 'me_fecha', type: 'timestamp' })
  fecha: Date;

  @Column({ name: 'me_from_me', default: false })
  fromMe: boolean;

  @ManyToOne(() => Conversacion, (conversacion) => conversacion.mensajes)
  @JoinColumn({ name: 'me_conv_id' }) 
  conversacion: Conversacion;
}
