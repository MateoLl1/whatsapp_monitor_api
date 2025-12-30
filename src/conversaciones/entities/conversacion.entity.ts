import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Asesor } from '../../asesores/entities/asesore.entity';
import { Mensaje } from '../../mensajes/entities/mensaje.entity';

@Entity({ name: 'conversaciones' })
export class Conversacion {
  @PrimaryGeneratedColumn({ name: 'co_id' })
  id: number;

  @Column({ name: 'co_cliente_numero', length: 30 })
  cliente_numero: string;

  @Column({ name: 'co_nom_cliente', nullable: true })
  nombre_cliente: string;

  @Column({ name: 'co_fe_inicio', type: 'timestamp', nullable: true })
  inicio: Date;

  @Column({ name: 'co_fe_fin', type: 'timestamp', nullable: true })
  fin: Date;

  @Column({ name: 'co_estado', length: 20, nullable: true })
  estado: string;

  @ManyToOne(() => Asesor, (asesor) => asesor.conversaciones, {
    nullable: false,
  })
  @JoinColumn({ name: 'co_asesor_id' })
  asesor: Asesor;

  @OneToMany(() => Mensaje, (msg) => msg.conversacion)
  mensajes: Mensaje[];
}
