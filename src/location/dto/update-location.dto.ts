import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LocationStatus } from '../schemas/location.schema';

export class UpdateLocationDto {
  @ApiProperty({ description: 'Latitude' })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ description: 'Longitude' })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({ description: 'Direction en degrés (0-360)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(360)
  heading!: number;

  @ApiProperty({ description: 'Vitesse en km/h' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  speed!: number;

  @ApiProperty({ description: 'Précision en mètres' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  accuracy!: number;

  @ApiProperty({ enum: LocationStatus, description: 'Statut du conducteur' })
  @IsEnum(LocationStatus)
  status!: LocationStatus;

  @ApiProperty({ description: 'ID de la course actuelle (optionnel)' })
  @IsOptional()
  @IsString()
  currentRideId?: string;

  @ApiProperty({ description: 'Adresse (optionnel)' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Ville (optionnel)' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ description: 'Pays (optionnel)' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ description: 'Niveau de batterie (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiProperty({ description: 'Si le conducteur est en mouvement' })
  @IsOptional()
  @IsBoolean()
  isMoving?: boolean;
}
