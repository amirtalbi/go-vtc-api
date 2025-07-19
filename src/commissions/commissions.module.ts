import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommissionsController } from './controllers/commissions.controller';
import { CommissionsService } from './services/commissions.service';
import { Commission, CommissionSchema } from './schemas/commission.schema';
import { RidesModule } from '../rides/rides.module';
import { DriversModule } from '../drivers/drivers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Commission.name, schema: CommissionSchema }
    ]),
    RidesModule,
    DriversModule,
  ],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
