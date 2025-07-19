import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Location, LocationDocument, LocationStatus } from '../schemas/location.schema';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { FindNearbyDriversDto } from '../dto/find-nearby-drivers.dto';

@Injectable()
export class LocationService {
  constructor(
    @InjectModel(Location.name) private locationModel: Model<LocationDocument>
  ) {}

  async updateDriverLocation(driverId: string, updateLocationDto: UpdateLocationDto): Promise<LocationDocument> {
    const location = await this.locationModel.findOneAndUpdate(
      { driverId },
      {
        ...updateLocationDto,
        lastUpdate: new Date(),
        updatedAt: new Date(),
      },
      { 
        new: true, 
        upsert: true,
        setDefaultsOnInsert: true
      }
    ).exec();

    return location;
  }

  async getDriverLocation(driverId: string): Promise<LocationDocument> {
    const location = await this.locationModel.findOne({ driverId }).exec();
    
    if (!location) {
      throw new NotFoundException(`Localisation du conducteur ${driverId} non trouvée`);
    }

    return location;
  }

  async findNearbyDrivers(findNearbyDto: FindNearbyDriversDto): Promise<LocationDocument[]> {
    const { latitude, longitude, radius = 5, limit = 10 } = findNearbyDto;
    
    // Conversion du rayon en radians (pour MongoDB)
    const radiusInRadians = radius / 6371; // 6371 km = rayon de la Terre

    const nearbyDrivers = await this.locationModel.aggregate([
      {
        $match: {
          status: { $in: [LocationStatus.ONLINE, LocationStatus.ON_RIDE] },
          lastUpdate: { 
            $gte: new Date(Date.now() - 5 * 60 * 1000) // Dernière mise à jour dans les 5 dernières minutes
          }
        }
      },
      {
        $addFields: {
          distance: {
            $multiply: [
              {
                $acos: {
                  $add: [
                    {
                      $multiply: [
                        { $sin: { $multiply: [{ $degreesToRadians: latitude }, 1] } },
                        { $sin: { $multiply: [{ $degreesToRadians: '$latitude' }, 1] } }
                      ]
                    },
                    {
                      $multiply: [
                        { $cos: { $multiply: [{ $degreesToRadians: latitude }, 1] } },
                        { $cos: { $multiply: [{ $degreesToRadians: '$latitude' }, 1] } },
                        { $cos: { $multiply: [
                          { $degreesToRadians: { $subtract: [longitude, '$longitude'] } }, 1
                        ] } }
                      ]
                    }
                  ]
                }
              },
              6371 // Rayon de la Terre en km
            ]
          }
        }
      },
      {
        $match: {
          distance: { $lte: radius }
        }
      },
      {
        $sort: { distance: 1 }
      },
      {
        $limit: limit
      }
    ]);

    return nearbyDrivers;
  }

  async setDriverStatus(driverId: string, status: LocationStatus, currentRideId?: string): Promise<LocationDocument> {
    const updateData: any = { 
      status, 
      lastUpdate: new Date(),
      updatedAt: new Date()
    };

    if (status === LocationStatus.ON_RIDE && currentRideId) {
      updateData.currentRideId = currentRideId;
    } else if (status !== LocationStatus.ON_RIDE) {
      updateData.$unset = { currentRideId: 1 };
    }

    const location = await this.locationModel.findOneAndUpdate(
      { driverId },
      updateData,
      { new: true }
    ).exec();

    if (!location) {
      throw new NotFoundException(`Localisation du conducteur ${driverId} non trouvée`);
    }

    return location;
  }

  async getOnlineDrivers(): Promise<LocationDocument[]> {
    return this.locationModel.find({
      status: { $in: [LocationStatus.ONLINE, LocationStatus.ON_RIDE] },
      lastUpdate: { 
        $gte: new Date(Date.now() - 5 * 60 * 1000) // Dernière mise à jour dans les 5 dernières minutes
      }
    })
    .populate('driverId', 'firstname lastname email')
    .exec();
  }

  async getDriversOnRide(): Promise<LocationDocument[]> {
    return this.locationModel.find({
      status: LocationStatus.ON_RIDE,
      currentRideId: { $exists: true }
    })
    .populate('driverId', 'firstname lastname email')
    .populate('currentRideId')
    .exec();
  }

  async cleanupOldLocations(): Promise<void> {
    // Marquer comme hors ligne les conducteurs qui n'ont pas mis à jour leur position depuis 10 minutes
    await this.locationModel.updateMany(
      {
        lastUpdate: { $lt: new Date(Date.now() - 10 * 60 * 1000) },
        status: { $ne: LocationStatus.OFFLINE }
      },
      { 
        status: LocationStatus.OFFLINE,
        updatedAt: new Date()
      }
    ).exec();
  }

  async calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): Promise<number> {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async remove(driverId: string): Promise<void> {
    const result = await this.locationModel.deleteOne({ driverId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Localisation du conducteur ${driverId} non trouvée`);
    }
  }
}
