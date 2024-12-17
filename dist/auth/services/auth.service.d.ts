import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<AuthResponse>;
    register(createUserDto: CreateUserDto): Promise<AuthResponse>;
}
