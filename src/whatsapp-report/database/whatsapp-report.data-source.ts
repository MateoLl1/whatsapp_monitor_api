import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { join } from 'path'
import * as dotenv from 'dotenv'
import { crearOpcionesConexionWhatsappReport } from './opciones-conexion-whatsapp-report'

dotenv.config()

/**
 * DataSource solo para la CLI de TypeORM (migraciones y seed de SQL Server).
 * No lo usa el API en tiempo de ejecución ni lo toca src/data-source.ts (Postgres).
 */
export default new DataSource({
  ...crearOpcionesConexionWhatsappReport((clave) => process.env[clave]),
  migrations: [join(__dirname, 'migraciones', '*{.ts,.js}')]
})
