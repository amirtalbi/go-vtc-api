import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Ride, RideSchema } from "./schemas/ride.schema";
import { RidesController } from "./controllers/rides.controller";
import { RidesService } from "./services/rides.service";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Ride.name, schema: RideSchema }]),
  ],
  controllers: [RidesController],
  providers: [RidesService],
  exports: [RidesService],
})
export class RidesModule {}
