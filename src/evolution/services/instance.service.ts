import { HttpException, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Asesor } from '../../asesores/entities/asesore.entity';

@Injectable()
export class InstanceService {
  private baseUrl = process.env.API_EVOLUTION_URL || 'http://localhost:8080';
  private apiKey = process.env.API_EVOLUTION_KEY;

  constructor(
    private readonly http: HttpService,
    @InjectRepository(Asesor)
    private readonly asesorRepo: Repository<Asesor>,
  ) {}

  async createInstance(instanceName: string) {
    const body = {
      instanceName,
      qrcode: false,
      integration: 'WHATSAPP-BAILEYS',
      groupsIgnore: true,
      alwaysOnline: false,
      readMessages: false,
      webhook: {
        url:
          process.env.WEBHOOK_NEST_EVOLUTION ||
          'http://host.docker.internal:3000/webhook/evolution',
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

    await this.asesorRepo.update({ nombre: instanceName }, { activo: false });
    return response.data;
  }

  async getConnectionState(instanceName: string) {
    try {
      const response = await firstValueFrom(
        this.http.get(
          `${this.baseUrl}/instance/connectionState/${instanceName}`,
          { headers: { apikey: this.apiKey } },
        ),
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException(
        { message: 'Error de conexión con Evolution' },
        500,
      );
    }
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
    await this.asesorRepo.update({ nombre: instanceName }, { activo: false });
    return response.data;
  }

  async logoutInstance(instanceName: string) {
    const response = await firstValueFrom(
      this.http.delete(`${this.baseUrl}/instance/logout/${instanceName}`, {
        headers: { apikey: this.apiKey },
      }),
    );
    await this.asesorRepo.update({ nombre: instanceName }, { activo: false });
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

  async handleConnectionUpdate(payload: any) {
    const sender = payload?.sender;
    if (!sender) return null;
    const numero = sender.split('@')[0];
    const state = payload?.data?.state;
    const instanceName = payload?.instance;
    await this.asesorRepo.update(
      { nombre: instanceName },
      { numero_whatsapp: numero, activo: state === 'open' },
    );
    return { tipo: 'connection', numero, state };
  }
}
