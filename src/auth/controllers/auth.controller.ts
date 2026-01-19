import { Controller, Post } from '@nestjs/common';
import { Public } from 'nest-keycloak-connect';
import { AuthService } from '../services/auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('token')
  async getToken() {
    console.log('🔥 SE PIDIO UN TOKEN NUEVO');
    return this.authService.getServiceToken();
  }
}
