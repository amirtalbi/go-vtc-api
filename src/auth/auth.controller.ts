import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'User successfully logged in' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }
}