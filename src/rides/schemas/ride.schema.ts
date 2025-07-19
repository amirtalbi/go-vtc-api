import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";
import { Driver } from "../../drivers/schemas/driver.schema";
import { Business } from "../../business/schemas/business.schema";

export type RideDocument = Ride & Document;

export enum RideStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

@Schema({ timestamps: true })
export class Ride {
  @Prop({ required: true })
  pickup_location!: string;

  @Prop({ required: true })
  dropoff_location!: string;

  @Prop({ required: true })
  pickup_time!: Date;

  @Prop({ required: true })
  estimated_distance!: number;

  @Prop({ required: true })
  estimated_duration!: number;

  @Prop({ required: true })
  price!: number;

  @Prop({ type: String, enum: RideStatus, default: RideStatus.PENDING })
  status!: RideStatus;

  @Prop({ type: Types.ObjectId, ref: "Driver" })
  driver?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  customer!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Business", required: true })
  business!: Types.ObjectId;
}

export const RideSchema = SchemaFactory.createForClass(Ride);
