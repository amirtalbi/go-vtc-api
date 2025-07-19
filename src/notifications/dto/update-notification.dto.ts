import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';
import { NotificationStatus } from '../schemas/notification.schema';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;
}
