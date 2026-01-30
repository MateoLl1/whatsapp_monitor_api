import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AsesoresModule } from './asesores/asesores.module';
import { ConversacionesModule } from './conversaciones/conversaciones.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { EvolutionModule } from './evolution/evolution.module';
import { FilesModule } from './files/files.module';
import { AuthModule } from './auth/auth.module';
import { SiacModule } from './siac/siac.module';
import { MediaModule } from './media/media.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
      serveStaticOptions: { index: false },
    }),

    AuthModule,
    AsesoresModule,
    ConversacionesModule,
    MensajesModule,
    EvolutionModule,
    FilesModule,
    SiacModule,
    MediaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule{}
