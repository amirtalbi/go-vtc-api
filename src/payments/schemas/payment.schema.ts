import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
  PARTIALLY_REFUNDED = "partially_refunded",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  PAYPAL = "paypal",
  APPLE_PAY = "apple_pay",
  GOOGLE_PAY = "google_pay",
  CASH = "cash",
  WALLET = "wallet",
  BANK_TRANSFER = "bank_transfer",
}

export enum PaymentType {
  RIDE = "ride",
  TIP = "tip",
  CANCELLATION_FEE = "cancellation_fee",
  COMMISSION = "commission",
  REFUND = "refund",
  SUBSCRIPTION = "subscription",
}

export enum Currency {
  EUR = "EUR",
  USD = "USD",
  GBP = "GBP",
  CAD = "CAD",
}

@Schema({ timestamps: true })
export class Payment {
  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, default: Currency.EUR })
  currency!: Currency;

  @Prop({ enum: PaymentMethod, required: true })
  paymentMethod!: PaymentMethod;

  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  status!: PaymentStatus;

  @Prop({ enum: PaymentType, default: PaymentType.RIDE })
  type!: PaymentType;

  @Prop({ type: Types.ObjectId, ref: "Ride" })
  rideId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  customerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "User" })
  driverId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Business" })
  businessId?: Types.ObjectId;

  // Informations de la carte de paiement
  @Prop({ type: Types.ObjectId, ref: "PaymentCard" })
  cardId?: Types.ObjectId;

  // Informations du processeur de paiement
  @Prop()
  stripePaymentIntentId?: string;

  @Prop()
  stripeChargeId?: string;

  @Prop()
  paypalOrderId?: string;

  @Prop()
  externalTransactionId?: string;

  // Détails financiers
  @Prop({ default: 0 })
  tipAmount!: number;

  @Prop({ default: 0 })
  serviceFee!: number;

  @Prop({ default: 0 })
  taxAmount!: number;

  @Prop({ default: 0 })
  discountAmount!: number;

  @Prop()
  totalAmount?: number; // Montant total calculé

  // Gestion des remboursements
  @Prop({ default: 0 })
  refundedAmount!: number;

  @Prop()
  refundReason?: string;

  @Prop()
  refundedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: "Payment" })
  originalPaymentId?: Types.ObjectId; // Pour les remboursements

  // Métadonnées
  @Prop()
  description?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  receiptUrl?: string;

  @Prop()
  invoiceNumber?: string;

  // Suivi des tentatives
  @Prop({ default: 0 })
  attemptCount!: number;

  @Prop()
  lastAttemptAt?: Date;

  @Prop()
  nextRetryAt?: Date;

  @Prop()
  failureReason?: string;

  // Dates importantes
  @Prop()
  processedAt?: Date;

  @Prop()
  authorizedAt?: Date;

  @Prop()
  capturedAt?: Date;

  @Prop()
  settledAt?: Date;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Index pour optimiser les performances
PaymentSchema.index({ customerId: 1, status: 1 });
PaymentSchema.index({ rideId: 1 });
PaymentSchema.index({ driverId: 1, status: 1 });
PaymentSchema.index({ stripePaymentIntentId: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ type: 1, status: 1 });
