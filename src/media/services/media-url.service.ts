import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TempLinksService } from './temp-links.service';

@Injectable()
export class MediaUrlService {
  constructor(
    private readonly config: ConfigService,
    private readonly tempLinks: TempLinksService,
  ) {}

  private baseUrl() {
    const origin = (this.config.get<string>('PUBLIC_ORIGIN') || '').replace(/\/$/, '');
    if (!origin) throw new Error('PUBLIC_ORIGIN is required');

    const port = this.config.get<string>('APP_PORT') || '3000';

    if (origin === 'http://localhost' || origin === 'http://127.0.0.1') return `${origin}:${port}`;
    return origin;
  }

  private ttlSeconds() {
    const raw = this.config.get<string>('MEDIA_TEMP_TTL') || '300';
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 300;
  }

  objectNameFrom(objeto: string) {
    const clean = (objeto ?? '').toString().trim();
    if (!clean) return null;

    const parts = clean.split('/').filter(Boolean);
    const last = parts.length ? parts[parts.length - 1] : clean;

    if (clean.includes('/api/')) return last;
    return last;
  }

  mediaTypeFromObjectName(objectName: string) {
    const name = (objectName || '').toLowerCase();

    if (name.endsWith('.ogg')) return 'audio';
    if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png')) return 'imagen';
    if (name.endsWith('.webp')) return 'sticker';
    if (name.endsWith('.mp4')) return 'video';
    return 'archivo';
  }

  tempUrlForObjectName(objectName: string, once = false) {
    const token = this.tempLinks.create(objectName, this.ttlSeconds(), once);
    return `${this.baseUrl()}/api/media/t/${token}`;
  }

  tempUrlFromObjeto(objeto: string, once = false) {
    const objectName = this.objectNameFrom(objeto);
    if (!objectName) return null;
    return this.tempUrlForObjectName(objectName, once);
  }
}
