import { Module } from '@nestjs/common';
import {
  KeycloakConnectModule,
  AuthGuard,
} from 'nest-keycloak-connect';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL || '',
      realm: process.env.KEYCLOAK_REALM || '',
      clientId: process.env.KEYCLOAK_CLIENT_ID || '',
      secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      // Configuración adicional
      realmPublicKey: process.env.KEYCLOAK_REALM_PUBLIC_KEY || '',
      bearerOnly: true,
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
