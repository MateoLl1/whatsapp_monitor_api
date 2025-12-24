import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'asesores' })
export class Asesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nombre: string;

  @Column({ default: true })
  activo: boolean;
}
