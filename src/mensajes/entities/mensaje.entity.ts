import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Conversacion } from '../../conversaciones/entities/conversacion.entity';

@Entity({ name: 'mensajes' })
export class Mensaje {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversacion, (conversacion) => conversacion.mensajes)
  conversacion: Conversacion;

  @Column({ type: 'text' })
  mensaje: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ default: false })
  fromMe: boolean;
}
