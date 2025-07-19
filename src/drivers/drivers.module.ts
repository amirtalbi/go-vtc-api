import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Driver, DriverSchema } from "./schemas/driver.schema";
import { DriversController } from "./controllers/drivers.controller";
import { DriversService } from "./services/drivers.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Driver.name, schema: DriverSchema }]),
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
