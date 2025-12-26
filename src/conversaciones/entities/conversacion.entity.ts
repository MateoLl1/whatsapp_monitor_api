
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Asesor } from '../../asesores/entities/asesore.entity';

@Entity({ name: 'conversaciones' })
export class Conversacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 30 })
  cliente_numero: string;

  @ManyToOne(() => Asesor, (asesor) => asesor.id)
  asesor: Asesor;

  @Column({ type: 'timestamp', nullable: true })
  inicio: Date;

  @Column({ type: 'timestamp', nullable: true })
  fin: Date;

  @Column({ length: 20, nullable: true })
  estado: string;

  @Column({ nullable: true })
  nombre_cliente: string;
}
