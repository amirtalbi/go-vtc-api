import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type BusinessDocument = Business & Document;

@Schema({ timestamps: true })
export class Business {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  legal_status!: string;

  @Prop({ required: true })
  address!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, unique: true })
  siret!: string;

  @Prop({ required: true, unique: true })
  tva_code!: string;

  @Prop({ required: true, unique: true })
  ape_code!: string;

  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  user!: Types.ObjectId;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);

BusinessSchema.index({ user: 1 });