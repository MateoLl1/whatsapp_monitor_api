import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Conversacion } from '../../conversaciones/entities/conversacion.entity';

@Entity({ name: 'asesores' })
export class Asesor {
  @PrimaryGeneratedColumn({ name: 'as_id' })
  id: number;

  @Column({ name: 'as_nombre', length: 100 })
  nombre: string;

  @Column({ name: 'as_activo', default: true })
  activo: boolean;

  @Column({ name: 'as_num_whatsapp', length: 20 })
  numero_whatsapp: string;

  @OneToMany(() => Conversacion, (conv) => conv.asesor)
  conversaciones: Conversacion[];
}
