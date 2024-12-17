import { UserRepository } from './repositories/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './schemas/user.schema';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: UserRepository);
    create(createUserDto: CreateUserDto): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
}
