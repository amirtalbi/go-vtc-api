import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';
import { VerifyTokenDto } from '../dto/verify-token.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiResponse({
    status: 201,
    description: 'Utilisateur enregistré avec succès',
  })
  @ApiResponse({ status: 409, description: "L'email existe déjà" })
  async register(@Body() createUserDto: CreateUserDto): Promise<AuthResponse> {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Utilisateur connecté avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse & { refreshToken: string }> {
    return this.authService.login(loginDto);
  }

  @Post('verify')
  @ApiBody({ type: VerifyTokenDto })
  @ApiResponse({ status: 201, description: 'Token vérifié avec succès' })
  @ApiResponse({ status: 400, description: 'Token invalide' })
  @HttpCode(HttpStatus.CREATED)
  async verify(@Body() verifyTokenDto: VerifyTokenDto): Promise<AuthResponse> {
    return await this.authService.verifyToken(verifyTokenDto);
  }

  @Post('refresh')
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 201, description: 'Token rafraîchi avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @HttpCode(HttpStatus.CREATED)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse & { refreshToken: string }> {
    return this.authService.refresh(refreshTokenDto);
  }
}