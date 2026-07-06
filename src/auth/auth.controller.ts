import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from './dto/login-dto';

@Controller('auth')
export class AuthController {
  @Post('/login')
  async login(@Body() body: LoginDto) {
    
  }
}
