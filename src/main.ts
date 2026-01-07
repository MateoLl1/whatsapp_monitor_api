import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:4200',
      'http://localhost:8080'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.use(bodyParser.json({ limit: '10mb' })); 
  app.use(bodyParser.urlencoded({ extended: true }));
  await app.listen(process.env.PORT ?? 3000,);
}
bootstrap();
