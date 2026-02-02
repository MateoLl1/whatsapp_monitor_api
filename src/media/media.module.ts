import { Module } from '@nestjs/common';
import { TempLinksService } from './services/temp-links.service';
import { MediaController } from './controllers/media.controller';
import { MediaServeController } from './controllers/media-serve.controller';
import { FilesModule } from '../files/files.module';
import { MediaUrlService } from './services/media-url.service';



@Module({
  imports: [FilesModule],
  providers: [TempLinksService,MediaUrlService],
  controllers: [MediaController, MediaServeController],
  exports: [MediaUrlService],
})
export class MediaModule {}
