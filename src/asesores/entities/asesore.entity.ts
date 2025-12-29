import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Conversacion } from '../../conversaciones/entities/conversacion.entity';

@Entity({ name: 'asesores' })
export class Asesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;

  @Column({ length: 20, nullable: true }) numero_whatsapp: string;

  @OneToMany(() => Conversacion, (conv) => conv.asesor)
  conversaciones: Conversacion[];
}
