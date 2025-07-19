import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationController } from './controllers/location.controller';
import { LocationService } from './services/location.service';
import { LocationGateway } from './gateways/location.gateway';
import { Location, LocationSchema } from './schemas/location.schema';
import { DriversModule } from '../drivers/drivers.module';
import { RidesModule } from '../rides/rides.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Location.name, schema: LocationSchema }
    ]),
    DriversModule,
    RidesModule,
  ],
  controllers: [LocationController],
  providers: [LocationService, LocationGateway],
  exports: [LocationService, LocationGateway],
})
export class LocationModule {}
