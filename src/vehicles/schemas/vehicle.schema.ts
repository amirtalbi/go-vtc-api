import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { Business } from "../../business/schemas/business.schema";

export type VehicleDocument = Vehicle & Document;

@Schema({ timestamps: true })
export class Vehicle {
  @Prop({ required: true })
  brand!: string;

  @Prop({ required: true })
  model!: string;

  @Prop({ required: true, unique: true })
  plate_number!: string;

  @Prop({ required: true })
  registration_card!: string;

  @Prop({ required: true })
  insurance_expiry!: Date;

  @Prop({ required: true })
  technical_inspection_expiry!: Date;

  @Prop({ required: true })
  seats!: number;

  @Prop({ type: Types.ObjectId, ref: "Business", required: true })
  business!: Types.ObjectId;

  @Prop({ default: true })
  active!: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
