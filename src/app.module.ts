import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsesoresModule } from './asesores/asesores.module';
import { ConversacionesModule } from './conversaciones/conversaciones.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { EvolutionModule } from './evolution/evolution.module';
import { FilesModule } from './files/files.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    AsesoresModule,
    ConversacionesModule,
    MensajesModule,
    EvolutionModule,
    FilesModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
