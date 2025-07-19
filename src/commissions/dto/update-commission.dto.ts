import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateCommissionDto } from './create-commission.dto';
import { CommissionStatus } from '../schemas/commission.schema';

export class UpdateCommissionDto extends PartialType(CreateCommissionDto) {
  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;
}
