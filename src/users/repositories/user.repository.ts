import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../schemas/user.schema";
import { CreateUserDto } from "../dto/create-user.dto";
import { RefreshToken } from '../../auth/interfaces/refresh-token.interface';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async setVerifyToken(id: string, token: string): Promise<void> {
    try {
      await this.userModel.updateOne({ _id: id }, { verifyToken: token });
      Logger.log(`Set verify token for user ${id} : ${token}`);
    } catch (error) {
      console.error(error);
    }
  }

  async verifyToken(email: string, token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email, verifyToken: token }).exec();
  }

  async markAsVerified(email: string): Promise<void> {
    await this.userModel.updateOne(
      { email },
      { verified: true, verifyToken: null },
    );
  }

  async deleteMany(arg: { verified: boolean; }): Promise<void> {
    await this.userModel.deleteMany(arg).exec();
  }

  private refreshTokens: RefreshToken[] = []; // Vous pouvez utiliser une collection dédiée en production

  async addRefreshToken(refreshToken: RefreshToken): Promise<void> {
    this.refreshTokens.push(refreshToken);
  }

  async findRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return this.refreshTokens.find(rt => rt.token === token);
  }

  async removeRefreshToken(token: string): Promise<void> {
    this.refreshTokens = this.refreshTokens.filter(rt => rt.token !== token);
  }
}
