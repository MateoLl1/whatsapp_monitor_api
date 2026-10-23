import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
  ServiceUnavailableException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { DataSource, EntityTarget, ObjectLiteral, Repository } from 'typeorm'
import { crearOpcionesConexionWhatsappReport } from './opciones-conexion-whatsapp-report'

/**
 * Conexión resiliente a SQL Server para los reportes WhatsApp.
 *
 * No usa TypeOrmModule.forRoot a propósito: si SQL Server no responde al arrancar,
 * TypeOrmModule detendría todo evolution-backend. Aquí la conexión se intenta en
 * segundo plano y se reintenta bajo demanda; si no está disponible, solo los
 * endpoints de reportes responden 503 y el resto del API sigue funcionando.
 */
@Injectable()
export class WhatsappReportDatabaseService implements OnModuleInit, OnApplicationShutdown {

  private readonly logger = new Logger(WhatsappReportDatabaseService.name)
  private dataSource: DataSource | null = null
  private conexionEnCurso: Promise<DataSource> | null = null

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    // Sin await: el arranque del API no espera a SQL Server
    this.conectar().catch(() => undefined)
  }

  async onApplicationShutdown() {
    if (this.dataSource?.isInitialized) await this.dataSource.destroy()
  }

  async obtenerRepositorio<T extends ObjectLiteral>(entidad: EntityTarget<T>): Promise<Repository<T>> {
    try {
      const dataSource = await this.conectar()
      return dataSource.getRepository(entidad)
    } catch {
      throw new ServiceUnavailableException('La base de datos de reportes WhatsApp no está disponible')
    }
  }

  private conectar(): Promise<DataSource> {
    if (this.dataSource?.isInitialized) return Promise.resolve(this.dataSource)

    // Evita abrir varias conexiones si llegan peticiones simultáneas
    if (!this.conexionEnCurso) {
      const opciones = crearOpcionesConexionWhatsappReport((clave) => this.config.get<string>(clave))

      this.conexionEnCurso = new DataSource(opciones)
        .initialize()
        .then((dataSource) => {
          this.dataSource = dataSource
          this.logger.log('Conexión a SQL Server de reportes WhatsApp establecida')
          return dataSource
        })
        .catch((error: Error) => {
          this.logger.error(`No se pudo conectar a SQL Server de reportes WhatsApp: ${error.message}`)
          throw error
        })
        .finally(() => {
          this.conexionEnCurso = null
        })
    }

    return this.conexionEnCurso
  }
}
