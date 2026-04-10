import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Asesor } from '../../asesores/entities/asesore.entity';

@Entity({ name: 'asesor_conexiones' })
export class AsesorConexion {
  @PrimaryGeneratedColumn({ name: 'ac_id' })
  id: number;

  @Column({ name: 'ac_evento', type: 'varchar', length: 50 })
  evento: string;

  @Column({ name: 'ac_estado', type: 'varchar', length: 30, nullable: true })
  estado: string | null;

  @Column({ name: 'ac_fecha', type: 'timestamp' })
  fecha: Date;

  @Column({ name: 'ac_status_reason', type: 'int', nullable: true })
  status_reason: number | null;

  @ManyToOne(() => Asesor, { nullable: false })
  @JoinColumn({ name: 'ac_asesor_id' })
  asesor: Asesor;
}