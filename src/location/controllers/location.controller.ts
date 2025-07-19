import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LocationService } from '../services/location.service';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { FindNearbyDriversDto } from '../dto/find-nearby-drivers.dto';
import { LocationStatus } from '../schemas/location.schema';

@ApiTags('location')
@Controller('location')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post('drivers/:driverId')
  @ApiOperation({ summary: 'Mettre à jour la localisation d\'un conducteur' })
  @ApiResponse({ status: 200, description: 'Localisation mise à jour avec succès' })
  updateDriverLocation(
    @Param('driverId') driverId: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return this.locationService.updateDriverLocation(driverId, updateLocationDto);
  }

  @Get('drivers/:driverId')
  @ApiOperation({ summary: 'Récupérer la localisation d\'un conducteur' })
  @ApiResponse({ status: 200, description: 'Localisation du conducteur' })
  @ApiResponse({ status: 404, description: 'Conducteur non trouvé' })
  getDriverLocation(@Param('driverId') driverId: string) {
    return this.locationService.getDriverLocation(driverId);
  }

  @Post('nearby')
  @ApiOperation({ summary: 'Trouver les conducteurs à proximité' })
  @ApiResponse({ status: 200, description: 'Liste des conducteurs à proximité' })
  findNearbyDrivers(@Body() findNearbyDto: FindNearbyDriversDto) {
    return this.locationService.findNearbyDrivers(findNearbyDto);
  }

  @Patch('drivers/:driverId/status')
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un conducteur' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour avec succès' })
  setDriverStatus(
    @Param('driverId') driverId: string,
    @Body() data: { status: LocationStatus; currentRideId?: string },
  ) {
    return this.locationService.setDriverStatus(driverId, data.status, data.currentRideId);
  }

  @Get('drivers/online')
  @ApiOperation({ summary: 'Récupérer tous les conducteurs en ligne' })
  @ApiResponse({ status: 200, description: 'Liste des conducteurs en ligne' })
  getOnlineDrivers() {
    return this.locationService.getOnlineDrivers();
  }

  @Get('drivers/on-ride')
  @ApiOperation({ summary: 'Récupérer tous les conducteurs en course' })
  @ApiResponse({ status: 200, description: 'Liste des conducteurs en course' })
  getDriversOnRide() {
    return this.locationService.getDriversOnRide();
  }

  @Get('distance')
  @ApiOperation({ summary: 'Calculer la distance entre deux points' })
  @ApiResponse({ status: 200, description: 'Distance calculée en kilomètres' })
  calculateDistance(
    @Query('lat1') lat1: number,
    @Query('lon1') lon1: number,
    @Query('lat2') lat2: number,
    @Query('lon2') lon2: number,
  ) {
    return this.locationService.calculateDistance(lat1, lon1, lat2, lon2);
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Nettoyer les anciennes localisations' })
  @ApiResponse({ status: 200, description: 'Nettoyage effectué' })
  cleanupOldLocations() {
    return this.locationService.cleanupOldLocations();
  }
}
