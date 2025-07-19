import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LocationDocument = Location & Document;

export enum LocationStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  ON_RIDE = 'on_ride',
  BREAK = 'break',
}

@Schema({ timestamps: true })
export class Location {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  driverId!: Types.ObjectId;

  @Prop({ required: true })
  latitude!: number;

  @Prop({ required: true })
  longitude!: number;

  @Prop({ required: true })
  heading!: number; // Direction en degrés (0-360)

  @Prop({ required: true })
  speed!: number; // Vitesse en km/h

  @Prop({ required: true })
  accuracy!: number; // Précision en mètres

  @Prop({ enum: LocationStatus, default: LocationStatus.OFFLINE })
  status!: LocationStatus;

  @Prop({ type: Types.ObjectId, ref: 'Ride' })
  currentRideId?: Types.ObjectId;

  @Prop({ default: Date.now })
  lastUpdate!: Date;

  @Prop()
  address?: string; // Adresse géocodée (optionnel)

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop({ default: 0 })
  batteryLevel?: number; // Niveau de batterie du téléphone

  @Prop({ default: false })
  isMoving!: boolean; // Si le conducteur est en mouvement

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const LocationSchema = SchemaFactory.createForClass(Location);

// Index géospatial pour les requêtes de proximité
LocationSchema.index({ latitude: 1, longitude: 1 });
LocationSchema.index({ driverId: 1 });
LocationSchema.index({ status: 1 });
LocationSchema.index({ lastUpdate: 1 });
