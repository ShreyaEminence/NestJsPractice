// users.controller.ts
import { Controller, Get } from '@nestjs/common';
import { UsersService } from '@users/users.service';
@Controller('users') // this sets the base route: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  fetchAllUser() {
    return this.usersService.getUsers();
  }
}
