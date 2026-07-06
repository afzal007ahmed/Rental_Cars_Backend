import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto } from './dto/login-dto';
import { UserService } from './../user/user.service';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index';
import { RegisterDto } from './dto/register-dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}
  async login(body: LoginDto) {
    const isUserExists = await this.userService.getUserByEmail(body.email);
    if (!isUserExists) {
      throw new NotFoundException('User not found.');
    }
    const isMatchPassword = await this.userService.matchUserPassword(
      isUserExists.password as string,
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
  async register(body: RegisterDto) {
    const isUserExists = await this.userService.getUserByEmail(body.email);
    if (isUserExists) {
      throw new ConflictException('User already exists.Please login');
    }
    const hashPassword = await bcrypt.hash(body.password, 10);
    body.password = hashPassword;
    const createdUser = await this.userService.createUser(body);
    const payload = { id: createdUser.id, guest: createdUser.guest };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: `${config.jwt.expiry}d`,
    });
    const { password, email, ...userData } = createdUser;
    return {
      token,
      user: userData,
    };
  }
}
