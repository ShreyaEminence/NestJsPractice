import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@src/constants';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = Users.find((u) => u.username === username);
    if (!user) return null;

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;

    return { userId: user.id, username: user.username };
  }

  async login(user: any) {
    const payload = { username: user.username, id: user.userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async signup(username: string, password: string) {
    const existingUser = Users.find((u) => u.username === username);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Users.length + 1,
      username,
      password: hashedPassword,
    };

    // Users.push(newUser);

    const payload = { username: newUser.username, id: newUser.id };
    return {
      message: 'Signup successful',
      access_token: this.jwtService.sign(payload),
    };
  }
}
