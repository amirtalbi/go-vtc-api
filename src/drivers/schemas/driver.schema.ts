import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { User } from "../../users/schemas/user.schema";
import { Business } from "../../business/schemas/business.schema";

export type DriverDocument = Driver & Document;

@Schema({ timestamps: true })
export class Driver {
  @Prop({ required: true, unique: true })
  vtc_card_number!: string;

  @Prop({ required: true })
  vtc_card_expiry!: Date;

  @Prop({ required: true })
  driving_license!: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true })
  user!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Business", required: true })
  business!: Types.ObjectId;

  @Prop({ default: true })
  active!: boolean;
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
