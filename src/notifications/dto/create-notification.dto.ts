import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject, IsDate, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @ApiProperty({ description: 'ID de l\'utilisateur destinataire' })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({ enum: NotificationType, description: 'Type de notification' })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiProperty({ description: 'Titre de la notification' })
  @IsNotEmpty()
  @IsString()
  title!: string;

  @ApiProperty({ description: 'Message de la notification' })
  @IsNotEmpty()
  @IsString()
  message!: string;

  @ApiProperty({ enum: NotificationPriority, description: 'Priorité de la notification', required: false })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiProperty({ description: 'Données additionnelles', required: false })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({ description: 'ID de la course associée', required: false })
  @IsOptional()
  @IsString()
  relatedRideId?: string;

  @ApiProperty({ description: 'ID du paiement associé', required: false })
  @IsOptional()
  @IsString()
  relatedPaymentId?: string;

  @ApiProperty({ description: 'URL de l\'image', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ description: 'URL d\'action', required: false })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @ApiProperty({ description: 'Date d\'expiration', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}
