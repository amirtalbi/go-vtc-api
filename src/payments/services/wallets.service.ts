import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { 
  Wallet, 
  WalletDocument, 
  WalletTransaction, 
  TransactionType, 
  TransactionStatus,
} from '../schemas/wallet.schema';
import { Currency } from '../schemas/payment.schema';

export interface CreateWalletDto {
  userId: string;
  currency?: Currency;
  maxBalance?: number;
  maxDailySpending?: number;
  maxMonthlySpending?: number;
}

export interface AddFundsDto {
  amount: number;
  description?: string;
  externalTransactionId?: string;
  metadata?: Record<string, any>;
}

export interface WithdrawFundsDto {
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TransferFundsDto {
  fromUserId: string;
  toUserId: string;
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>
  ) {}

  async create(createWalletDto: CreateWalletDto): Promise<WalletDocument> {
    const existingWallet = await this.walletModel.findOne({ userId: createWalletDto.userId });
    if (existingWallet) {
      throw new BadRequestException('Wallet already exists for this user');
    }

    const wallet = new this.walletModel(createWalletDto);
    return wallet.save();
  }

  async findByUser(userId: string): Promise<WalletDocument> {
    const wallet = await this.walletModel.findOne({ userId }).exec();
    if (!wallet) {
      throw new NotFoundException(`Wallet not found for user ${userId}`);
    }
    return wallet;
  }

  async findOrCreate(userId: string): Promise<WalletDocument> {
    try {
      return await this.findByUser(userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.create({ userId });
      }
      throw error;
    }
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findByUser(userId);
    return wallet.balance;
  }

  async addFunds(userId: string, addFundsDto: AddFundsDto): Promise<WalletDocument> {
    const { amount, description, externalTransactionId, metadata } = addFundsDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.findOrCreate(userId);

    // Vérifier la limite de solde maximum
    if (wallet.balance + amount > wallet.maxBalance) {
      throw new BadRequestException(`Adding funds would exceed maximum balance of ${wallet.maxBalance}`);
    }

    // Créer la transaction
    const transaction: WalletTransaction = {
      type: TransactionType.CREDIT,
      amount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || 'Funds added to wallet',
      externalTransactionId,
      metadata,
      createdAt: new Date(),
    };

    // Mettre à jour le portefeuille
    wallet.balance += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    return wallet.save();
  }

  async withdrawFunds(userId: string, withdrawFundsDto: WithdrawFundsDto): Promise<WalletDocument> {
    const { amount, description, metadata } = withdrawFundsDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.findByUser(userId);

    // Vérifier le solde suffisant
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Créer la transaction
    const transaction: WalletTransaction = {
      type: TransactionType.WITHDRAWAL,
      amount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || 'Funds withdrawn from wallet',
      metadata,
      createdAt: new Date(),
    };

    // Mettre à jour le portefeuille
    wallet.balance -= amount;
    wallet.totalSpent += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    return wallet.save();
  }

  async debitForRide(userId: string, amount: number, rideId: string): Promise<WalletDocument> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.findByUser(userId);

    // Vérifier le solde suffisant
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance for ride payment');
    }

    // Vérifier les limites de dépenses
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!wallet.lastResetDate || wallet.lastResetDate < today) {
      wallet.dailySpent = 0;
      wallet.lastResetDate = today;
    }

    if (wallet.dailySpent + amount > wallet.maxDailySpending) {
      throw new BadRequestException('Daily spending limit exceeded');
    }

    // Créer la transaction
    const transaction: WalletTransaction = {
      type: TransactionType.DEBIT,
      amount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: 'Payment for ride',
      relatedRideId: rideId as any,
      createdAt: new Date(),
    };

    // Mettre à jour le portefeuille
    wallet.balance -= amount;
    wallet.totalSpent += amount;
    wallet.dailySpent += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    return wallet.save();
  }

  async creditForEarnings(userId: string, amount: number, rideId: string, description?: string): Promise<WalletDocument> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.findOrCreate(userId);

    // Créer la transaction
    const transaction: WalletTransaction = {
      type: TransactionType.COMMISSION,
      amount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || 'Earnings from ride',
      relatedRideId: rideId as any,
      createdAt: new Date(),
    };

    // Mettre à jour le portefeuille
    wallet.balance += amount;
    wallet.totalEarnings += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    return wallet.save();
  }

  async refund(userId: string, amount: number, originalPaymentId: string, reason?: string): Promise<WalletDocument> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const wallet = await this.findOrCreate(userId);

    // Créer la transaction de remboursement
    const transaction: WalletTransaction = {
      type: TransactionType.REFUND,
      amount,
      currency: wallet.currency,
      status: TransactionStatus.COMPLETED,
      description: reason || 'Refund',
      relatedPaymentId: originalPaymentId as any,
      createdAt: new Date(),
    };

    // Mettre à jour le portefeuille
    wallet.balance += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();

    return wallet.save();
  }

  async transferFunds(transferFundsDto: TransferFundsDto): Promise<{ fromWallet: WalletDocument; toWallet: WalletDocument }> {
    const { fromUserId, toUserId, amount, description, metadata } = transferFundsDto;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (fromUserId === toUserId) {
      throw new BadRequestException('Cannot transfer to same user');
    }

    const [fromWallet, toWallet] = await Promise.all([
      this.findByUser(fromUserId),
      this.findOrCreate(toUserId),
    ]);

    // Vérifier le solde suffisant
    if (fromWallet.balance < amount) {
      throw new BadRequestException('Insufficient balance for transfer');
    }

    // Créer les transactions
    const debitTransaction: WalletTransaction = {
      type: TransactionType.DEBIT,
      amount,
      currency: fromWallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || `Transfer to user ${toUserId}`,
      metadata: { ...metadata, transferTo: toUserId },
      createdAt: new Date(),
    };

    const creditTransaction: WalletTransaction = {
      type: TransactionType.CREDIT,
      amount,
      currency: toWallet.currency,
      status: TransactionStatus.COMPLETED,
      description: description || `Transfer from user ${fromUserId}`,
      metadata: { ...metadata, transferFrom: fromUserId },
      createdAt: new Date(),
    };

    // Mettre à jour les portefeuilles
    fromWallet.balance -= amount;
    fromWallet.totalSpent += amount;
    fromWallet.transactions.push(debitTransaction);
    fromWallet.updatedAt = new Date();

    toWallet.balance += amount;
    toWallet.transactions.push(creditTransaction);
    toWallet.updatedAt = new Date();

    // Sauvegarder les deux portefeuilles
    const [updatedFromWallet, updatedToWallet] = await Promise.all([
      fromWallet.save(),
      toWallet.save(),
    ]);

    return {
      fromWallet: updatedFromWallet,
      toWallet: updatedToWallet,
    };
  }

  async getTransactionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    type?: TransactionType
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const wallet = await this.findByUser(userId);
    
    let transactions = wallet.transactions;
    
    if (type) {
      transactions = transactions.filter(t => t.type === type);
    }

    // Trier par date décroissante
    transactions.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

    const total = transactions.length;
    const skip = (page - 1) * limit;
    const paginatedTransactions = transactions.slice(skip, skip + limit);

    return {
      transactions: paginatedTransactions,
      total,
    };
  }

  async blockWallet(userId: string, reason: string): Promise<WalletDocument> {
    const wallet = await this.findByUser(userId);
    
    wallet.isBlocked = true;
    wallet.blockedReason = reason;
    wallet.blockedAt = new Date();
    wallet.updatedAt = new Date();

    return wallet.save();
  }

  async unblockWallet(userId: string): Promise<WalletDocument> {
    const wallet = await this.findByUser(userId);
    
    wallet.isBlocked = false;
    wallet.blockedReason = undefined;
    wallet.blockedAt = undefined;
    wallet.updatedAt = new Date();

    return wallet.save();
  }

  async getWalletStats(userId: string): Promise<{
    balance: number;
    totalEarnings: number;
    totalSpent: number;
    transactionCount: number;
    dailySpent: number;
    monthlySpent: number;
  }> {
    const wallet = await this.findByUser(userId);
    
    return {
      balance: wallet.balance,
      totalEarnings: wallet.totalEarnings,
      totalSpent: wallet.totalSpent,
      transactionCount: wallet.transactions.length,
      dailySpent: wallet.dailySpent,
      monthlySpent: wallet.monthlySpent,
    };
  }

  async updateSpendingLimits(
    userId: string,
    limits: {
      maxBalance?: number;
      maxDailySpending?: number;
      maxMonthlySpending?: number;
    }
  ): Promise<WalletDocument> {
    const wallet = await this.findByUser(userId);
    
    if (limits.maxBalance !== undefined) wallet.maxBalance = limits.maxBalance;
    if (limits.maxDailySpending !== undefined) wallet.maxDailySpending = limits.maxDailySpending;
    if (limits.maxMonthlySpending !== undefined) wallet.maxMonthlySpending = limits.maxMonthlySpending;
    
    wallet.updatedAt = new Date();
    
    return wallet.save();
  }
}
