import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { TempLinksService } from '../services/temp-links.service';


@Controller('media')
export class MediaController {
  constructor(private readonly temp: TempLinksService) {}

  @Post('temp')
  create(@Body() body: { objectName: string; ttlSeconds?: number; once?: boolean }, @Req() req: Request) {
    const ttl = body.ttlSeconds ?? 300;
    const once = body.once ?? false;

    const token = this.temp.create(body.objectName, ttl, once);

    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol;
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host');

    return {
      url: `${proto}://${host}/api/media/t/${token}`,
      expiresInSeconds: ttl,
    };
  }
}
