import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentCardDocument = PaymentCard & Document;

export enum CardType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  PREPAID = 'prepaid',
}

export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMERICAN_EXPRESS = 'amex',
  DISCOVER = 'discover',
  JCB = 'jcb',
  DINERS_CLUB = 'diners',
  UNKNOWN = 'unknown',
}

@Schema({ timestamps: true })
export class PaymentCard {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  last4!: string; // 4 derniers chiffres

  @Prop({ enum: CardBrand, required: true })
  brand!: CardBrand;

  @Prop({ enum: CardType, required: true })
  type!: CardType;

  @Prop({ required: true })
  expiryMonth!: number;

  @Prop({ required: true })
  expiryYear!: number;

  @Prop()
  holderName?: string;

  @Prop()
  country?: string;

  @Prop()
  fingerprint?: string; // Empreinte unique de la carte

  @Prop({ default: false })
  isDefault!: boolean;

  @Prop({ default: true })
  isActive!: boolean;

  // Informations du processeur de paiement
  @Prop()
  stripeCardId?: string;

  @Prop()
  stripeCustomerId?: string;

  @Prop()
  paypalPaymentMethodId?: string;

  // Vérifications de sécurité
  @Prop({ default: false })
  isVerified!: boolean;

  @Prop()
  verifiedAt?: Date;

  @Prop({ default: 0 })
  failedAttempts!: number;

  @Prop()
  lastUsedAt?: Date;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const PaymentCardSchema = SchemaFactory.createForClass(PaymentCard);

// Index pour optimiser les performances
PaymentCardSchema.index({ userId: 1, isActive: 1 });
PaymentCardSchema.index({ stripeCardId: 1 });
PaymentCardSchema.index({ fingerprint: 1 });
