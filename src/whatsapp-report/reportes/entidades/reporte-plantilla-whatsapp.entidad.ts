import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'SI_REPORTE_PLANTILLAS_WHATSAPP' })
export class ReportePlantillaWhatsappEntity {

  @PrimaryGeneratedColumn({ name: 'RPW_ID', type: 'int' })
  rpw_id: number

  @Column({ name: 'RPW_ID_PLANTILLA', type: 'varchar', length: 100 })
  rpw_id_plantilla: string

  @Column({ name: 'RPW_NOMBRE_PLANTILLA', type: 'varchar', length: 200 })
  rpw_nombre_plantilla: string

  @Column({ name: 'RPW_NUMERO_VARIABLES', type: 'int' })
  rpw_numero_variables: number

  @Column({ name: 'RPW_UUID', type: 'varchar', length: 200 })
  rpw_uuid: string

  @Column({ name: 'RPW_NOMBRE', type: 'varchar', length: 200 })
  rpw_nombre: string

  @Column({ name: 'RPW_NUMERO', type: 'varchar', length: 50 })
  rpw_numero: string

  @Column({ name: 'RPW_FECHA', type: 'date' })
  rpw_fecha: Date

  @Column({ name: 'RPW_HORA', type: 'time' })
  rpw_hora: string

  @Column({ name: 'RPW_ESTADO', type: 'varchar', length: 50 })
  rpw_estado: string

  @Column({ name: 'RPW_MENSAJE', type: 'nvarchar', length: 'max' })
  rpw_mensaje: string

  @Column({ name: 'RPW_VARIABLE_JSON', type: 'nvarchar', length: 'max' })
  rpw_variable_json: string
}