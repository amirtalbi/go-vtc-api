import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import ms from 'ms';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from "../../email/email.service";
import { CreateUserDto } from "../../users/dto/create-user.dto";
import { UsersService } from "../../users/users.service";
import { LoginDto } from "../dto/login.dto";
import { RefreshTokenDto } from "../dto/refresh-token.dto";
import { VerifyTokenDto } from "../dto/verify-token.dto";
import { AuthResponse } from "../interfaces/auth-response.interface";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse & { refreshToken: string }> {
    const user = await this.usersService.validateCredentials(
      loginDto.email,
      loginDto.password
    );
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    const payload: JwtPayload = { email: user.email, sub: user._id };
    
    const accessTokenExpiresIn = this.configService.get<string>('jwt.accessTokenExpiresIn') || '15m';
    const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenExpiresIn });
    const refreshToken = uuidv4();

    const refreshTokenExpiresIn = this.configService.get<string>("jwt.refreshTokenExpiresIn") || "7d";
    const refreshTokenExpiresMs = ms(refreshTokenExpiresIn);

    if (typeof refreshTokenExpiresMs !== 'number') {
      throw new Error(`Invalid refreshTokenExpiresIn value: ${refreshTokenExpiresIn}`);
    }

    await this.usersService.addRefreshToken({
      token: refreshToken,
      userId: user._id,
      expires: new Date(Date.now() + refreshTokenExpiresMs),
    });

    return {
      access_token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const user = await this.usersService.create(createUserDto);
    const { password, ...result } = user;

    const token = Math.floor(100000 + Math.random() * 900000).toString();

    await this.emailService.sendVerifyUser(user.email, token);
    await this.usersService.setVerifyToken(user._id, token);

    return {
      access_token: token,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    };
  }

  async verifyToken(verifyTokenDto: VerifyTokenDto): Promise<AuthResponse> {
    const { email, token } = verifyTokenDto;
    this.logger.debug(
      `Vérification du token pour l'email: ${email} avec le token: ${token}`
    );
    const user = await this.usersService.verifyToken(email, token);
    if (!user) {
      this.logger.warn(`Token invalide pour l'email: ${email}`);
      throw new UnauthorizedException("Invalid token");
    }
    await this.usersService.markAsVerified(user.email);
    this.logger.log(`Utilisateur vérifié: ${email}`);

    const payload: JwtPayload = { email: user.email, sub: user._id };
    this.logger.debug(`Génération du JWT pour l'utilisateur: ${email}`);

    const accessTokenExpiresIn = this.configService.get<string>('jwt.accessTokenExpiresIn') || '15m';
    const accessToken = this.jwtService.sign(payload, { expiresIn: accessTokenExpiresIn });

    return {
      access_token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse & { refreshToken: string }> {
    const { refreshToken } = refreshTokenDto;
    const storedToken = await this.usersService.findRefreshToken(refreshToken);

    if (!storedToken || storedToken.expires < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    const user = await this.usersService.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload: JwtPayload = { email: user.email, sub: user._id };
    const newAccessTokenExpiresIn = this.configService.get<string>('jwt.accessTokenExpiresIn') || '15m';
    const newAccessToken = this.jwtService.sign(payload, { expiresIn: newAccessTokenExpiresIn });
    const newRefreshToken = uuidv4();

    // Supprimer l'ancien refresh token et en ajouter un nouveau
    await this.usersService.removeRefreshToken(refreshToken);

    const refreshTokenExpiresIn = this.configService.get<string>("jwt.refreshTokenExpiresIn") || "7d";
    const refreshTokenExpiresMs = ms(refreshTokenExpiresIn);

    if (typeof refreshTokenExpiresMs !== 'number') {
      throw new Error(`Invalid refreshTokenExpiresIn value: ${refreshTokenExpiresIn}`);
    }

    await this.usersService.addRefreshToken({
      token: newRefreshToken,
      userId: user._id,
      expires: new Date(Date.now() + refreshTokenExpiresMs),
    });

    return {
      access_token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    };
  }
}
