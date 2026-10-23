import { Module } from '@nestjs/common';

import { ReportesModule } from './reportes/reportes.module';
import { CallbellModule } from './callbell/callbell.module';

/**
 * Reportería de plantillas WhatsApp (migrado desde whatsapp-report-api).
 *
 * - Usa su propia conexión SQL Server (WHATSAPP_DB_*), aislada de Postgres.
 * - La autenticación la resuelve el AuthModule global de evolution-backend (Keycloak).
 * - Rutas: /api/reportes/plantillas-whatsapp y /api/callbell/plantillas/:uuid
 */
@Module({
  imports: [ReportesModule, CallbellModule],
})
export class WhatsappReportModule {}
