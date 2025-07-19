import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Payment, PaymentSchema } from "./schemas/payment.schema";
import { PaymentCard, PaymentCardSchema } from "./schemas/payment-card.schema";
import { Wallet, WalletSchema } from "./schemas/wallet.schema";
import { PaymentsController } from "./controllers/payments.controller";
import { PaymentCardsController } from "./controllers/payment-cards.controller";
import { WalletsController } from "./controllers/wallets.controller";
import { PaymentsService } from "./services/payments.service";
import { PaymentCardsService } from "./services/payment-cards.service";
import { WalletsService } from "./services/wallets.service";
import { StripeService } from "./services/stripe.service";
import { CommissionsModule } from "../commissions/commissions.module";
import { NotificationsModule } from "../notifications/notifications.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: PaymentCard.name, schema: PaymentCardSchema },
      { name: Wallet.name, schema: WalletSchema },
    ]),
    CommissionsModule,
    NotificationsModule,
  ],
  controllers: [
    PaymentsController,
    PaymentCardsController,
    WalletsController,
  ],
  providers: [
    PaymentsService,
    PaymentCardsService,
    WalletsService,
    StripeService,
  ],
  exports: [
    PaymentsService,
    PaymentCardsService,
    WalletsService,
    StripeService,
  ],
})
export class PaymentsModule {}
