import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register-dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  async login(@Body() body: LoginDto) {
    return await this.authService.login(body);
  }
  @Post('/register')
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }

  @Post('/guest/login')
  async guestLogin() {
    return this.authService.guestLogin();
  }
}
