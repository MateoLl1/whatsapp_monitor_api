import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';

type Entry = { objectName: string; exp: number; once: boolean };

@Injectable()
export class TempLinksService {
  private store = new Map<string, Entry>();

  create(objectName: string, ttlSeconds = 300, once = false) {
    const token = randomBytes(32).toString('hex');
    const exp = Date.now() + ttlSeconds * 1000;
    this.store.set(token, { objectName, exp, once });
    return token;
  }

  resolve(token: string) {
    const entry = this.store.get(token);
    if (!entry) return null;

    if (Date.now() > entry.exp) {
      this.store.delete(token);
      return null;
    }

    if (entry.once) this.store.delete(token);
    return entry.objectName;
  }

  purgeExpired() {
    const now = Date.now();
    for (const [k, v] of this.store.entries()) {
      if (now > v.exp) this.store.delete(k);
    }
  }
}
