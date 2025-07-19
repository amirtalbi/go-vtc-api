import { Injectable, ConflictException } from "@nestjs/common";
import { UserRepository } from "./repositories/user.repository";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserDocument } from "./schemas/user.schema";
import { RefreshToken } from "../auth/interfaces/refresh-token.interface";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userRepository.findByEmail(
      createUserDto.email
    );
    if (existingUser) {
      throw new ConflictException("Email already exists");
    }
    return this.userRepository.create(createUserDto);
  }

  async validateCredentials(
    email: string,
    password: string
  ): Promise<UserDocument | null> {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    if (!(await bcrypt.compare(password, user.password))) {
      return null;
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }

  async setVerifyToken(id: string, token: string): Promise<void> {
    return this.userRepository.setVerifyToken(id, token);
  }

  async verifyToken(
    email: string,
    token: string
  ): Promise<UserDocument | null> {
    return this.userRepository.verifyToken(email, token);
  }

  async markAsVerified(email: string): Promise<void> {
    return this.userRepository.markAsVerified(email);
  }

  async removeUnverifiedUsers(): Promise<void> {
    await this.userRepository.deleteMany({ verified: false });
  }

  async addRefreshToken(refreshToken: RefreshToken): Promise<void> {
    return this.userRepository.addRefreshToken(refreshToken);
  }

  async findRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return this.userRepository.findRefreshToken(token);
  }

  async removeRefreshToken(token: string): Promise<void> {
    return this.userRepository.removeRefreshToken(token);
  }
}
