import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    return this.userRepository.create(createUserDto);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userRepository.findById(id);
  }
}