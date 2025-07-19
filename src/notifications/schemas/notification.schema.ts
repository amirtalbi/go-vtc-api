import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  RIDE_REQUEST = 'ride_request',
  RIDE_ACCEPTED = 'ride_accepted',
  RIDE_REJECTED = 'ride_rejected',
  RIDE_STARTED = 'ride_started',
  RIDE_COMPLETED = 'ride_completed',
  RIDE_CANCELLED = 'ride_cancelled',
  DRIVER_ARRIVED = 'driver_arrived',
  PAYMENT_PROCESSED = 'payment_processed',
  PAYMENT_FAILED = 'payment_failed',
  RATING_REQUEST = 'rating_request',
  PROMOTION = 'promotion',
  SYSTEM_UPDATE = 'system_update',
  COMMISSION_PAID = 'commission_paid',
  DOCUMENT_VERIFICATION = 'document_verification',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ enum: NotificationType, required: true })
  type!: NotificationType;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ enum: NotificationPriority, default: NotificationPriority.MEDIUM })
  priority!: NotificationPriority;

  @Prop({ enum: NotificationStatus, default: NotificationStatus.PENDING })
  status!: NotificationStatus;

  @Prop({ type: Object })
  data?: Record<string, any>; // Données additionnelles (rideId, paymentId, etc.)

  @Prop({ type: Types.ObjectId, ref: 'Ride' })
  relatedRideId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  relatedPaymentId?: Types.ObjectId;

  @Prop()
  imageUrl?: string;

  @Prop()
  actionUrl?: string; // URL pour une action spécifique

  @Prop()
  expiresAt?: Date;

  @Prop()
  readAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop({ default: false })
  isPushSent!: boolean;

  @Prop({ default: false })
  isEmailSent!: boolean;

  @Prop({ default: false })
  isSMSSent!: boolean;

  @Prop()
  pushResponse?: string; // Réponse du service de push notification

  @Prop()
  emailResponse?: string; // Réponse du service d'email

  @Prop()
  smsResponse?: string; // Réponse du service SMS

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Index pour optimiser les requêtes
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
