import { NestMiddleware, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { config } from '../../config/index';

export class AuthMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (error?: any) => void) {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        throw new UnauthorizedException('token is missing');
      }
      const bearerToken = authorization.split(' ')[0];
      if (!bearerToken) {
        throw new UnauthorizedException(
          'Bearer keyword is missing from the header',
        );
      }
      const token = authorization.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Auth token is missing');
      }

      const user = jwt.verify(token, config.jwt.secret);
      req.user = user;
      next();
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
