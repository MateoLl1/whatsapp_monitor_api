import { Injectable } from '@nestjs/common'

import { ConfigService } from '@nestjs/config'
import { firstValueFrom } from 'rxjs'
import { HttpService } from '@nestjs/axios';

@Injectable()
export class CallbellService {

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService
  ) {}

  async obtenerPlantillaPorUuid(uuid: string) {
    const baseUrl = this.config.get<string>('CALLBELL_API_BASE')
    const token = this.config.get<string>('CALLBELL_BEARER_TOKEN')

    const url = `${baseUrl}/templates/${uuid}`

    const response = await firstValueFrom(
      this.http.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    )

    return response.data
  }
}