import { Module } from '@nestjs/common'

import { ReportePlantillasWhatsappRepositorio } from './repositorios/reporte-plantillas-whatsapp.repositorio'
import { ReportePlantillasWhatsappController } from './controller/reporte-plantillas-whatsapp.controller';
import { ReportePlantillasWhatsappService } from './services/reporte-plantillas-whatsapp.service';
import { WhatsappReportDatabaseModule } from '../database/whatsapp-report-database.module'


@Module({
  imports: [WhatsappReportDatabaseModule],
  controllers: [ReportePlantillasWhatsappController],
  providers: [ReportePlantillasWhatsappRepositorio, ReportePlantillasWhatsappService],
  exports: [ReportePlantillasWhatsappService]
})
export class ReportesModule {}
