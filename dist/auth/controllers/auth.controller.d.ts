import { AuthService } from '../services/auth.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { AuthResponse } from '../interfaces/auth-response.interface';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(createUserDto: CreateUserDto): Promise<AuthResponse>;
    login(req: any): Promise<AuthResponse>;
}
