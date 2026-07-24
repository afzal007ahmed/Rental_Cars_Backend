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
import { randomUUID } from 'crypto';
import { UniqueConstraintError } from 'sequelize';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  guestLogin() {
    const sessionId = randomUUID();
    const token = jwt.sign(
      {
        guest: true,
        sessionId,
      },
      config.jwt.secret,
      {
        expiresIn: `${config.jwt.expiry}d`,
      },
    );
    return {
      token,
      user: {
        name: 'GUEST',
        guest: true,
        sessionId,
      },
    };
  }
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
    const userData = {
      id: isUserExists.id,
      name: isUserExists.name,
      guest: isUserExists.guest,
    };
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
    let createdUser;
    try {
      createdUser = await this.userService.createUser({
        ...body,
        password: hashPassword,
        guest: false,
      });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('User already exists.Please login');
      }
      throw error;
    }
    const payload = { id: createdUser.id, guest: createdUser.guest };
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: `${config.jwt.expiry}d`,
    });
    const userData = {
      id: createdUser.id,
      name: createdUser.name,
      guest: createdUser.guest,
    };
    return {
      token,
      user: userData,
    };
  }
}
