import { Document } from "mongoose";
interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    hashPassword(): Promise<void>;
}
declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser> & IUser & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export { User, IUser };
