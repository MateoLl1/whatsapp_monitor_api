import { Controller, Post, Get, Delete, Param, Body } from '@nestjs/common';
import { InstanceService } from '../services/instance.service';

@Controller('evolution')
export class EvolutionController {
  constructor(private readonly instanceService: InstanceService) {}

  @Post('create')
  async createInstance(@Body('instanceName') instanceName: string) {
    return this.instanceService.createInstance(instanceName);
  }

  @Get('state/:instance')
  async getConnectionState(@Param('instance') instance: string) {
    return this.instanceService.getConnectionState(instance);
  }

  @Get('instances')
  async fetchInstances() {
    return this.instanceService.fetchInstances();
  }

  @Delete('delete/:name')
  async deleteInstance(@Param('name') name: string) {
    return this.instanceService.deleteInstance(name);
  }

  @Delete('logout/:name')
  async logoutInstance(@Param('name') name: string) {
    return this.instanceService.logoutInstance(name);
  }
}
