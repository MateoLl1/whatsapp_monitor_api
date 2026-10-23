import { DataSourceOptions } from 'typeorm'
import { ReportePlantillaWhatsappEntity } from '../reportes/entidades/reporte-plantilla-whatsapp.entidad'

/**
 * Opciones de la conexión SQL Server del módulo de reportes WhatsApp.
 *
 * Es independiente de la conexión Postgres principal de evolution-backend:
 * usa variables con prefijo WHATSAPP_DB_* para no colisionar con DB_*.
 */
export function crearOpcionesConexionWhatsappReport(
  leer: (clave: string) => string | undefined
): DataSourceOptions {
  const instancia = (leer('WHATSAPP_DB_INSTANCIA') ?? '').trim()

  return {
    type: 'mssql',
    host: leer('WHATSAPP_DB_HOST'),
    port: Number(leer('WHATSAPP_DB_PORT') ?? 1433),
    username: leer('WHATSAPP_DB_USER'),
    password: leer('WHATSAPP_DB_PASSWORD'),
    database: leer('WHATSAPP_DB_NAME'),
    entities: [ReportePlantillaWhatsappEntity],
    synchronize: false,
    options: {
      encrypt: (leer('WHATSAPP_DB_ENCRYPT') ?? 'false') === 'true',
      trustServerCertificate: (leer('WHATSAPP_DB_TRUST_CERT') ?? 'true') === 'true',
      ...(instancia ? { instanceName: instancia } : {})
    }
  }
}
