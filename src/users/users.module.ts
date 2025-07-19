import { Module, forwardRef } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserRepository } from "./repositories/user.repository";
import { User, UserSchema } from "./schemas/user.schema";
import { UsersService } from "./users.service";
import { AuthModule } from "../auth/auth.module";
import { UnverifiedUserCleanupService } from './cron/unverified-user-cleanup.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule),
  ],
  providers: [UsersService, UserRepository, UnverifiedUserCleanupService],
  exports: [UsersService],
})
export class UsersModule {}
