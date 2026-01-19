import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();

    const hasExt = /\.[a-zA-Z0-9]+$/.test(req.path);
    if (hasExt) return next();

    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="AutoConsa"');
      return res.status(401).end();
    }

    const decoded = Buffer.from(auth.split(' ')[1], 'base64').toString();
    const [user, pass] = decoded.split(':');

    const u = process.env.FRONTEND_USER ?? '';
    const p = process.env.FRONTEND_PASS ?? '';

    if (user !== u || pass !== p) {
      res.setHeader('WWW-Authenticate', 'Basic realm="AutoConsa"');
      return res.status(401).end();
    }

    return next();
  });

  app.setGlobalPrefix('api');

  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    const hasExt = /\.[a-zA-Z0-9]+$/.test(req.path);
    if (hasExt) return next();
    return res.sendFile(join(process.cwd(), 'public', 'index.html'));
  });

  await app.listen(process.env.APP_PORT ?? 3000);
}

bootstrap();
