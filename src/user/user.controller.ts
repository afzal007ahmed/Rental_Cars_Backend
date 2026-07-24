import { Controller, Get, Request } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/me')
  async me(@Request() req: any) {
    const user = req.user;
    return await this.userService.me(user);
  }
}
