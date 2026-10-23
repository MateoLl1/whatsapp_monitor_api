import { Module } from '@nestjs/common'
import { WhatsappReportDatabaseService } from './whatsapp-report-database.service'

@Module({
  providers: [WhatsappReportDatabaseService],
  exports: [WhatsappReportDatabaseService]
})
export class WhatsappReportDatabaseModule {}
