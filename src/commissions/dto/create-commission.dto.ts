import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommissionType } from '../schemas/commission.schema';

export class CreateCommissionDto {
  @ApiProperty({ description: 'ID de la course' })
  @IsNotEmpty()
  @IsString()
  rideId!: string;

  @ApiProperty({ description: 'ID du conducteur' })
  @IsNotEmpty()
  @IsString()
  driverId!: string;

  @ApiProperty({ description: 'ID de l\'entreprise (optionnel)' })
  @IsOptional()
  @IsString()
  businessId?: string;

  @ApiProperty({ description: 'Montant de la course' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  rideAmount!: number;

  @ApiProperty({ enum: CommissionType, description: 'Type de commission' })
  @IsEnum(CommissionType)
  commissionType!: CommissionType;

  @ApiProperty({ description: 'Taux de commission (pourcentage ou montant fixe)' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  commissionRate!: number;

  @ApiProperty({ description: 'Notes additionnelles (optionnel)' })
  @IsOptional()
  @IsString()
  notes?: string;
}
