import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../dto/create-user.dto';
export declare class UserRepository {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    create(createUserDto: CreateUserDto): Promise<UserDocument>;
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
}
