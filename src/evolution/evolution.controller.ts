import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { EvolutionService } from './evolution.service';

@Controller('evolution')
export class EvolutionController {
  constructor(private readonly evolutionService: EvolutionService) {}

  @Post('create')
  async createInstance(
    @Body('instanceName') instanceName: string,
    @Body('webhookUrl') webhookUrl: string,
  ) {
    return this.evolutionService.createInstance(instanceName, webhookUrl);
  }

  @Get('state/:instance')
  async getConnectionState(@Param('instance') instance: string) {
    return this.evolutionService.getConnectionState(instance);
  }

  @Get('instances')
  async fetchInstances() {
    return this.evolutionService.fetchInstances();
  }

  @Delete('delete/:name')
  async deleteInstance(@Param('name') name: string) {
    return this.evolutionService.deleteInstance(name);
  }

  @Delete('logut/:name')
  async logoutInstance(@Param('name') name: string) {
    return this.evolutionService.logoutInstance(name);
  }
}
