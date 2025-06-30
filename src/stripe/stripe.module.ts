import { Module } from '@nestjs/common';
import { StripeController } from '@stripe/stripe.controller';
import { StripeService } from '@stripe/stripe.service';

@Module({
  controllers: [StripeController],
  providers: [StripeService]
})
export class StripeModule {}
