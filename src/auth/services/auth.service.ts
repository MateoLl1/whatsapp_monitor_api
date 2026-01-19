import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getServiceToken() {
    const baseUrl = this.config.get<string>('KEYCLOAK_AUTH_SERVER_URL');
    const realm = this.config.get<string>('KEYCLOAK_REALM');
    const clientId = this.config.get<string>('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.config.get<string>('KEYCLOAK_CLIENT_SECRET');

    if (!baseUrl || !realm || !clientId || !clientSecret) {
      throw new Error('Keycloak configuration is incomplete');
    }

    const url = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`;

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });

    const response = await firstValueFrom(
      this.http.post(url, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }),
    );

    return {
      access_token: response.data.access_token,
      expires_in: response.data.expires_in,
      token_type: response.data.token_type,
    };
  }
}
