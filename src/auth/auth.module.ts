import { Module } from '@nestjs/common';
import {
  KeycloakConnectModule,
  AuthGuard,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';


@Module({
  imports: [
    ConfigModule,
    HttpModule,
    KeycloakConnectModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        authServerUrl: config.get<string>('KEYCLOAK_AUTH_SERVER_URL') ?? '',
        realm: config.get<string>('KEYCLOAK_REALM') ?? '',
        clientId: config.get<string>('KEYCLOAK_CLIENT_ID') ?? '',
        secret: config.get<string>('KEYCLOAK_CLIENT_SECRET') ?? '',
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
        tokenValidation: TokenValidation.ONLINE,
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [KeycloakConnectModule],
})
export class AuthModule {}
