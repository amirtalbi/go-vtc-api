import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Currency } from './payment.schema';

export type WalletDocument = Wallet & Document;

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
  REFUND = 'refund',
  BONUS = 'bonus',
  CASHBACK = 'cashback',
  COMMISSION = 'commission',
  WITHDRAWAL = 'withdrawal',
  TOP_UP = 'top_up',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ enum: TransactionType, required: true })
  type!: TransactionType;

  @Prop({ required: true })
  amount!: number;

  @Prop({ enum: Currency, default: Currency.EUR })
  currency!: Currency;

  @Prop({ enum: TransactionStatus, default: TransactionStatus.PENDING })
  status!: TransactionStatus;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  relatedPaymentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Ride' })
  relatedRideId?: Types.ObjectId;

  @Prop()
  externalTransactionId?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: Date.now })
  createdAt?: Date;
}

const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, default: 0 })
  balance!: number;

  @Prop({ enum: Currency, default: Currency.EUR })
  currency!: Currency;

  @Prop({ default: 0 })
  pendingAmount!: number; // Montant en attente de validation

  @Prop({ default: 0 })
  totalEarnings!: number; // Total des gains (pour les conducteurs)

  @Prop({ default: 0 })
  totalSpent!: number; // Total des dépenses (pour les clients)

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isBlocked!: boolean;

  @Prop()
  blockedReason?: string;

  @Prop()
  blockedAt?: Date;

  // Limites du portefeuille
  @Prop({ default: 10000 })
  maxBalance!: number;

  @Prop({ default: 1000 })
  maxDailySpending!: number;

  @Prop({ default: 5000 })
  maxMonthlySpending!: number;

  // Statistiques
  @Prop({ default: 0 })
  dailySpent!: number;

  @Prop({ default: 0 })
  monthlySpent!: number;

  @Prop()
  lastResetDate?: Date;

  // Transactions
  @Prop([WalletTransactionSchema])
  transactions!: WalletTransaction[];

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

// Index pour optimiser les performances
WalletSchema.index({ userId: 1 });
WalletSchema.index({ isActive: 1, isBlocked: 1 });
WalletSchema.index({ 'transactions.createdAt': -1 });
WalletSchema.index({ 'transactions.status': 1 });
