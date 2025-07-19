import { IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FindNearbyDriversDto {
  @ApiProperty({ description: 'Latitude du point de recherche' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ description: 'Longitude du point de recherche' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({ description: 'Rayon de recherche en kilomètres', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(50)
  radius?: number = 5;

  @ApiProperty({ description: 'Nombre maximum de conducteurs à retourner', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
