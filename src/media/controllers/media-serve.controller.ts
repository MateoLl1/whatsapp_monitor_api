import { Controller, Get, Param, Res } from '@nestjs/common';
import type { Response } from 'express';
import { MinioService } from '../../files/minio.service';
import { TempLinksService } from '../services/temp-links.service';
import { Public } from 'nest-keycloak-connect';


@Controller('media')
export class MediaServeController {
  constructor(private readonly temp: TempLinksService, private readonly minio: MinioService) {}

  @Public()
  @Get('t/:token')
  async serve(@Param('token') token: string, @Res() res: Response) {
    const objectName = this.temp.resolve(token);
    if (!objectName) return res.status(404).end();

    const stream = await this.minio.getObject(objectName);
    stream.pipe(res);
  }
}
