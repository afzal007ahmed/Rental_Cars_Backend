import { Injectable } from '@nestjs/common';
import { User, UserTableInterface } from './models/user.model';
import bcrypt from 'bcrypt';
import { RegisterDto } from 'src/auth/dto/register-dto';

interface UserInterface {
  id: string;
  guest: string;
}

@Injectable()
export class UserService {
  async getUserByEmail(email: string) {
    return (await User.findOne({ where: { email: email } }))?.dataValues;
  }
  async matchUserPassword(hashedPassword: string, password: string) {
    const verify = await bcrypt.compare(password, hashedPassword);
    return verify;
  }
  async createUser(body: RegisterDto & { guest: false }) {
    return (await User.create(body)).dataValues;
  }
  async me(user: UserInterface) {
    let data: any;
    if (user.guest) {
      data = { name: 'GUEST', guest: true };
    } else {
      data = await User.findOne({ where: { id: user.id } });
    }
    if (user.guest) {
      return data;
    } else {
      const userDetails = { ...(data?.dataValues as UserTableInterface) };
      delete userDetails.password;
      return userDetails;
    }
  }
}
