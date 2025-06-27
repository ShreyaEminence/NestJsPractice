import { Injectable } from '@nestjs/common';
import { Users } from '@src/constants';

@Injectable()
export class UsersService {
  getUsers() {
    return { listOfUsers: Users };
  }
}
