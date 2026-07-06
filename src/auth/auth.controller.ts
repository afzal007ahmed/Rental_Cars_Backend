import {
  Body,
  Controller,
  NotFoundException,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { UserService } from './../user/user.service.ts';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index';

@Controller('auth')
export class AuthController {
  constructor(private readonly userService: UserService) {}

  @Post('/login')
  async login(@Body() body: LoginDto) {
    const isUserExists = await this.userService.getUserByEmail(body.email);
    if (!isUserExists) {
      throw new NotFoundException('User not found.');
    }
    const isMatchPassword = await this.userService.matchUserPassword(
      isUserExists.password,
      body.password,
    );
    if (!isMatchPassword) {
      throw new UnauthorizedException('Password mismatch');
    }
    const payload = { id: isUserExists.id, guest: isUserExists.guest };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: `${config.jwt.expiry}d`,
    });
    const { password, email, ...userData } = isUserExists;
    return {
      token,
      user: userData,
    };
  }
}
