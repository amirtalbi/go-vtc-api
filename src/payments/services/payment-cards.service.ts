import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentCard, PaymentCardDocument, CardBrand, CardType } from '../schemas/payment-card.schema';
import { StripeService } from './stripe.service';

export interface CreatePaymentCardDto {
  userId: string;
  stripePaymentMethodId: string;
  holderName?: string;
  isDefault?: boolean;
}

export interface UpdatePaymentCardDto {
  holderName?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

@Injectable()
export class PaymentCardsService {
  constructor(
    @InjectModel(PaymentCard.name) private paymentCardModel: Model<PaymentCardDocument>,
    private stripeService: StripeService
  ) {}

  async create(createPaymentCardDto: CreatePaymentCardDto): Promise<PaymentCardDocument> {
    const { userId, stripePaymentMethodId, holderName, isDefault = false } = createPaymentCardDto;

    try {
      // Récupérer les détails de la carte depuis Stripe
      const stripePaymentMethod = await this.stripeService.stripe.paymentMethods.retrieve(stripePaymentMethodId);
      
      if (!stripePaymentMethod.card) {
        throw new BadRequestException('Invalid payment method: not a card');
      }

      const card = stripePaymentMethod.card;

      // Si c'est la carte par défaut, désactiver les autres cartes par défaut
      if (isDefault) {
        await this.paymentCardModel.updateMany(
          { userId, isDefault: true },
          { isDefault: false }
        );
      }

      // Vérifier si c'est la première carte de l'utilisateur
      const existingCardsCount = await this.paymentCardModel.countDocuments({ userId, isActive: true });
      const shouldBeDefault = isDefault || existingCardsCount === 0;

      const paymentCard = new this.paymentCardModel({
        userId,
        last4: card.last4,
        brand: this.mapStripeBrandToCardBrand(card.brand),
        type: this.mapStripeCardTypeToCardType(card.funding),
        expiryMonth: card.exp_month,
        expiryYear: card.exp_year,
        holderName: holderName || stripePaymentMethod.billing_details?.name,
        country: card.country,
        fingerprint: card.fingerprint,
        isDefault: shouldBeDefault,
        stripeCardId: stripePaymentMethodId,
        stripeCustomerId: stripePaymentMethod.customer as string,
        isVerified: true,
        verifiedAt: new Date(),
      });

      return paymentCard.save();
    } catch (error: any) {
      throw new BadRequestException(`Failed to create payment card: ${error.message}`);
    }
  }

  async findAll(): Promise<PaymentCardDocument[]> {
    return this.paymentCardModel.find({ isActive: true }).exec();
  }

  async findByUser(userId: string): Promise<PaymentCardDocument[]> {
    return this.paymentCardModel
      .find({ userId, isActive: true })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<PaymentCardDocument> {
    const card = await this.paymentCardModel.findById(id).exec();
    if (!card) {
      throw new NotFoundException(`Payment card with ID ${id} not found`);
    }
    return card;
  }

  async findDefault(userId: string): Promise<PaymentCardDocument | null> {
    return this.paymentCardModel
      .findOne({ userId, isDefault: true, isActive: true })
      .exec();
  }

  async update(id: string, updatePaymentCardDto: UpdatePaymentCardDto): Promise<PaymentCardDocument> {
    const { isDefault, ...updateData } = updatePaymentCardDto;

    // Si on change la carte par défaut
    if (isDefault) {
      const card = await this.findOne(id);
      await this.paymentCardModel.updateMany(
        { userId: card.userId, isDefault: true },
        { isDefault: false }
      );
    }

    const updatedCard = await this.paymentCardModel
      .findByIdAndUpdate(
        id,
        { ...updateData, isDefault, updatedAt: new Date() },
        { new: true }
      )
      .exec();

    if (!updatedCard) {
      throw new NotFoundException(`Payment card with ID ${id} not found`);
    }

    return updatedCard;
  }

  async setAsDefault(id: string): Promise<PaymentCardDocument> {
    const card = await this.findOne(id);
    
    // Désactiver les autres cartes par défaut de l'utilisateur
    await this.paymentCardModel.updateMany(
      { userId: card.userId, isDefault: true },
      { isDefault: false }
    );

    return this.update(id, { isDefault: true });
  }

  async deactivate(id: string): Promise<PaymentCardDocument> {
    const card = await this.findOne(id);

    // Si c'était la carte par défaut, trouver une autre carte à définir comme défaut
    if (card.isDefault) {
      const otherCard = await this.paymentCardModel
        .findOne({ 
          userId: card.userId, 
          _id: { $ne: id }, 
          isActive: true 
        })
        .exec();

      if (otherCard) {
        await this.update(otherCard._id.toString(), { isDefault: true });
      }
    }

    // Détacher la carte de Stripe si possible
    try {
      if (card.stripeCardId) {
        await this.stripeService.detachPaymentMethod(card.stripeCardId);
      }
    } catch (error) {
      // Log l'erreur mais ne pas faire échouer l'opération
      console.error('Failed to detach payment method from Stripe:', error);
    }

    return this.update(id, { isActive: false });
  }

  async remove(id: string): Promise<void> {
    const card = await this.findOne(id);
    
    // Détacher de Stripe avant suppression
    try {
      if (card.stripeCardId) {
        await this.stripeService.detachPaymentMethod(card.stripeCardId);
      }
    } catch (error) {
      console.error('Failed to detach payment method from Stripe:', error);
    }

    const result = await this.paymentCardModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Payment card with ID ${id} not found`);
    }
  }

  async updateLastUsed(id: string): Promise<void> {
    await this.paymentCardModel
      .findByIdAndUpdate(id, { lastUsedAt: new Date() })
      .exec();
  }

  async incrementFailedAttempts(id: string): Promise<PaymentCardDocument> {
    const card = await this.paymentCardModel
      .findByIdAndUpdate(
        id,
        { $inc: { failedAttempts: 1 } },
        { new: true }
      )
      .exec();

    if (!card) {
      throw new NotFoundException(`Payment card with ID ${id} not found`);
    }

    // Si trop d'échecs, désactiver la carte
    if (card.failedAttempts >= 5) {
      await this.update(id, { isActive: false });
    }

    return card;
  }

  async resetFailedAttempts(id: string): Promise<void> {
    await this.paymentCardModel
      .findByIdAndUpdate(id, { failedAttempts: 0 })
      .exec();
  }

  // Méthodes utilitaires privées
  private mapStripeBrandToCardBrand(stripeBrand: string): CardBrand {
    const brandMap: Record<string, CardBrand> = {
      'visa': CardBrand.VISA,
      'mastercard': CardBrand.MASTERCARD,
      'amex': CardBrand.AMERICAN_EXPRESS,
      'discover': CardBrand.DISCOVER,
      'jcb': CardBrand.JCB,
      'diners': CardBrand.DINERS_CLUB,
    };
    return brandMap[stripeBrand] || CardBrand.UNKNOWN;
  }

  private mapStripeCardTypeToCardType(stripeFunding: string): CardType {
    const typeMap: Record<string, CardType> = {
      'credit': CardType.CREDIT,
      'debit': CardType.DEBIT,
      'prepaid': CardType.PREPAID,
    };
    return typeMap[stripeFunding] || CardType.CREDIT;
  }
}
