import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MessageService {
  private baseUrl = process.env.API_EVOLUTION_URL || 'http://localhost:8080';
  private apiKey = process.env.API_EVOLUTION_KEY;

  constructor(private readonly http: HttpService) {}

  async sendTextMessage(instanceName: string, number: string, text: string) {
    const response = await firstValueFrom(
      this.http.post(
        `${this.baseUrl}/message/sendText/${instanceName}`,
        { number, text },
        { headers: { apikey: this.apiKey } },
      ),
    );
    return response.data;
  }
}
