import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthResponse } from '../interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.comparePassword && await user.comparePassword(password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any): Promise<AuthResponse> {
    const payload: JwtPayload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user.toObject();
    return this.login(result);
  }
}