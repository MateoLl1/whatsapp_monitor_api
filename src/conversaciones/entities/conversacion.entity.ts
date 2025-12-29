import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Asesor } from '../../asesores/entities/asesore.entity';
import { Mensaje } from '../../mensajes/entities/mensaje.entity';

@Entity({ name: 'conversaciones' })
export class Conversacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  cliente_numero: string;

  @ManyToOne(() => Asesor, (asesor) => asesor.conversaciones)
  asesor: Asesor;

  @Column({ type: 'timestamp', nullable: true })
  inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fin: Date;

  @Column({ length: 20, nullable: true })
  estado: string;

  @Column({ nullable: true })
  nombre_cliente: string;

  @OneToMany(() => Mensaje, (msg) => msg.conversacion)
  mensajes: Mensaje[];
}
