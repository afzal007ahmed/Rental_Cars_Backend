import { Injectable } from '@nestjs/common';
import { User } from './models/user.model';

@Injectable()
export class UserService {
  async getUserByEmail(email: string) {
    return await User.findOne({ where: { email: email } });
  }
}
