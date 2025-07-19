import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CommissionDocument = Commission & Document;

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

export enum CommissionStatus {
  PENDING = 'pending',
  CALCULATED = 'calculated',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Commission {
  @Prop({ type: Types.ObjectId, ref: 'Ride', required: true })
  rideId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Business' })
  businessId?: Types.ObjectId;

  @Prop({ required: true })
  rideAmount!: number;

  @Prop({ enum: CommissionType, required: true })
  commissionType!: CommissionType;

  @Prop({ required: true })
  commissionRate!: number; // Pourcentage ou montant fixe

  @Prop({ required: true })
  commissionAmount!: number; // Montant final de la commission

  @Prop({ required: true })
  driverEarnings!: number; // Gains du conducteur après commission

  @Prop({ enum: CommissionStatus, default: CommissionStatus.PENDING })
  status!: CommissionStatus;

  @Prop()
  paidAt?: Date;

  @Prop()
  notes?: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);
