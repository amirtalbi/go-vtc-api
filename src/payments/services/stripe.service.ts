import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  public readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY') || 'sk_test_dummy';
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2025-06-30.basil',
    });
  }

  async createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email,
        name,
      });
      this.logger.log(`Stripe customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'eur',
    customerId?: string,
    paymentMethodId?: string,
    metadata?: Record<string, string>
  ): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100), // Stripe utilise les centimes
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (customerId) {
        params.customer = customerId;
      }

      if (paymentMethodId) {
        params.payment_method = paymentMethodId;
        params.confirm = true;
      }

      const paymentIntent = await this.stripe.paymentIntents.create(params);
      this.logger.log(`PaymentIntent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Error creating PaymentIntent:', error);
      throw error;
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });
      this.logger.log(`PaymentIntent confirmed: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Error confirming PaymentIntent:', error);
      throw error;
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.cancel(paymentIntentId);
      this.logger.log(`PaymentIntent cancelled: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      this.logger.error('Error cancelling PaymentIntent:', error);
      throw error;
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: Stripe.RefundCreateParams.Reason
  ): Promise<Stripe.Refund> {
    try {
      const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        params.amount = Math.round(amount * 100);
      }

      if (reason) {
        params.reason = reason;
      }

      const refund = await this.stripe.refunds.create(params);
      this.logger.log(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      this.logger.error('Error creating refund:', error);
      throw error;
    }
  }

  async attachPaymentMethod(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });
      this.logger.log(`PaymentMethod attached: ${paymentMethod.id}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error('Error attaching PaymentMethod:', error);
      throw error;
    }
  }

  async detachPaymentMethod(paymentMethodId: string): Promise<Stripe.PaymentMethod> {
    try {
      const paymentMethod = await this.stripe.paymentMethods.detach(paymentMethodId);
      this.logger.log(`PaymentMethod detached: ${paymentMethod.id}`);
      return paymentMethod;
    } catch (error) {
      this.logger.error('Error detaching PaymentMethod:', error);
      throw error;
    }
  }

  async listCustomerPaymentMethods(
    customerId: string,
    type: 'card' | 'us_bank_account' = 'card'
  ): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await this.stripe.paymentMethods.list({
        customer: customerId,
        type,
      });
      return paymentMethods.data;
    } catch (error) {
      this.logger.error('Error listing PaymentMethods:', error);
      throw error;
    }
  }

  async createSetupIntent(customerId: string): Promise<Stripe.SetupIntent> {
    try {
      const setupIntent = await this.stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });
      this.logger.log(`SetupIntent created: ${setupIntent.id}`);
      return setupIntent;
    } catch (error) {
      this.logger.error('Error creating SetupIntent:', error);
      throw error;
    }
  }

  async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      this.logger.error('Error retrieving PaymentIntent:', error);
      throw error;
    }
  }

  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      return await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
    } catch (error) {
      this.logger.error('Error retrieving customer:', error);
      throw error;
    }
  }

  async updateCustomer(
    customerId: string,
    params: Stripe.CustomerUpdateParams
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, params);
      this.logger.log(`Customer updated: ${customer.id}`);
      return customer;
    } catch (error) {
      this.logger.error('Error updating customer:', error);
      throw error;
    }
  }

  async deleteCustomer(customerId: string): Promise<Stripe.DeletedCustomer> {
    try {
      const deleted = await this.stripe.customers.del(customerId);
      this.logger.log(`Customer deleted: ${customerId}`);
      return deleted;
    } catch (error) {
      this.logger.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Méthodes utilitaires
  formatAmountForStripe(amount: number): number {
    return Math.round(amount * 100);
  }

  formatAmountFromStripe(amount: number): number {
    return amount / 100;
  }

  // Gestion des webhooks
  constructEvent(payload: string | Buffer, signature: string): Stripe.Event {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    try {
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Error constructing webhook event:', error);
      throw error;
    }
  }
}
