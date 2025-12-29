import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EvolutionService {
  private baseUrl = process.env.API_EVOLUTION_URL || 'http://localhost:8080';
  private apiKey = process.env.API_EVOLUTION_KEY;

  constructor(private readonly http: HttpService) {}

  async createInstance(instanceName: string, webhookUrl: string) {
    const body = {
      instanceName,
      qrcode: false,
      integration: 'WHATSAPP-BAILEYS',
      groupsIgnore: true,
      alwaysOnline: false,
      readMessages: false,
      webhook: {
        url: webhookUrl,
        byEvents: false,
        base64: false,
        events: [
          'APPLICATION_STARTUP',
          'QRCODE_UPDATED',
          'MESSAGES_SET',
          'MESSAGES_UPSERT',
          'MESSAGES_UPDATE',
          'MESSAGES_DELETE',
          'SEND_MESSAGE',
          'CONTACTS_SET',
          'CONTACTS_UPSERT',
          'CONTACTS_UPDATE',
          'PRESENCE_UPDATE',
          'CHATS_SET',
          'CHATS_UPSERT',
          'CHATS_UPDATE',
          'CHATS_DELETE',
          'CONNECTION_UPDATE',
          'LABELS_EDIT',
          'LABELS_ASSOCIATION',
          'CALL',
          'REMOVE_INSTANCE',
          'LOGOUT_INSTANCE',
          'REMOVE_INSTANCE',
        ],
      },
    };

    const response = await firstValueFrom(
      this.http.post(`${this.baseUrl}/instance/create`, body, {
        headers: { apikey: this.apiKey },
      }),
    );
    return response.data;
  }

  async getConnectionState(instanceName: string) {
    const response = await firstValueFrom(
      this.http.get(
        `${this.baseUrl}/instance/connectionState/${instanceName}`,
        {
          headers: { apikey: this.apiKey },
        },
      ),
    );
    return response.data;
  }

  async fetchInstances() {
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/instance/fetchInstances`, {
        headers: { apikey: this.apiKey },
      }),
    );
    return response.data;
  }

  async deleteInstance(instanceName: string) {
    const response = await firstValueFrom(
      this.http.delete(`${this.baseUrl}/instance/delete/${instanceName}`, {
        headers: { apikey: this.apiKey },
      }),
    );
    return response.data;
  }

  async logoutInstance(instanceName: string) {
    const response = await firstValueFrom(
      this.http.delete(`${this.baseUrl}/instance/logout/${instanceName}`, {
        headers: { apikey: this.apiKey },
      }),
    );
    return response.data;
  }

  async connectInstance(instanceName: string) {
    const response = await firstValueFrom(
      this.http.get(`${this.baseUrl}/instance/connect/${instanceName}`, {
        headers: { apikey: this.apiKey },
      }),
    );
    return response.data;
  }
}
