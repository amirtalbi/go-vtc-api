import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { BusinessModule } from './business/business.module';
import { VehiclesModule } from "./vehicles/vehicles.module";
import { DriversModule } from "./drivers/drivers.module";
import { RidesModule } from "./rides/rides.module";
import { PaymentsModule } from "./payments/payments.module";
import { CommissionsModule } from "./commissions/commissions.module";
import { LocationModule } from "./location/location.module";
import { NotificationsModule } from "./notifications/notifications.module";
import { EmailModule } from "./email/email.module";
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    UsersModule,
    BusinessModule,
    VehiclesModule,
    DriversModule,
    RidesModule,
    PaymentsModule,
    CommissionsModule,
    LocationModule,
    NotificationsModule,
    EmailModule,
  ],
})
export class AppModule {}
