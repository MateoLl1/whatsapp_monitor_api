import { Module } from '@nestjs/common';
import {
  KeycloakConnectModule,
  AuthGuard,
  PolicyEnforcementMode,
  TokenValidation,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    KeycloakConnectModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        authServerUrl: config.get('KEYCLOAK_AUTH_SERVER_URL') || '',
        realm: config.get('KEYCLOAK_REALM') || '',
        clientId: config.get('KEYCLOAK_CLIENT_ID') || '',
        secret: config.get('KEYCLOAK_CLIENT_SECRET') || '',
        policyEnforcement: PolicyEnforcementMode.PERMISSIVE,
        tokenValidation: TokenValidation.ONLINE,
      }),
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
  providers: [
    // Guard global para autenticación
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [KeycloakConnectModule],
})
export class AuthModule {}
