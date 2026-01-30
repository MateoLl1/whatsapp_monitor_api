import { Module } from '@nestjs/common';
import { TempLinksService } from './services/temp-links.service';
import { MediaController } from './controllers/media.controller';
import { MediaServeController } from './controllers/media-serve.controller';
import { FilesModule } from '../files/files.module';


@Module({
  imports: [FilesModule],
  providers: [TempLinksService],
  controllers: [MediaController, MediaServeController],
  exports: [TempLinksService],
})
export class MediaModule {}
