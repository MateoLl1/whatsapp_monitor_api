import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { CallbellController } from './callbell.controller'
import { CallbellService } from './callbell.service'


@Module({
  imports: [HttpModule],
  controllers: [CallbellController],
  providers: [CallbellService]
})
export class CallbellModule {}