import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>('STRIPE_SECRET_KEY')!,
      {
        apiVersion: '2025-05-28.basil',
      },
    );
  }

  // async createFreePlanProduct() {
  //   // ✅ 1. Create Product
  //   const product = await this.stripe.products.create({
  //     name: '7-Day Free Plan',
  //     description:
  //       'This plan is free for 7 days and will auto-cancel after trial.',
  //   });

  //   // ✅ 2. Create $0 Recurring Price
  //   const price = await this.stripe.prices.create({
  //     unit_amount: 0, // 0 cents = $0
  //     currency: 'usd',
  //     recurring: { interval: 'month' },
  //     product: product.id,
  //   });

  //   // ✅ 3. Create Checkout Session with 7-day trial and auto-cancel
  //   const session = await this.stripe.checkout.sessions.create({
  //     mode: 'subscription',
  //     payment_method_types: ['card'],
  //     line_items: [
  //       {
  //         price: price.id, // use the actual $0 price ID you just created
  //         quantity: 1,
  //       },
  //     ],
  //     subscription_data: {
  //       trial_period_days: 7,
  //       trial_settings: {
  //         end_behavior: {
  //           missing_payment_method: 'cancel', // cancel after 7 days if no card added
  //         },
  //       },
  //     },
  //     success_url: 'https://yourdomain.com/success',
  //     cancel_url: 'https://yourdomain.com/cancel',
  //   });

  //   return {
  //     productId: product.id,
  //     priceId: price.id,
  //     checkoutUrl: session.url,
  //   };
  // }

  async getProductsWithPrices() {
    const products = await this.stripe.products.list({ active: true });
    const prices = await this.stripe.prices.list({ active: true });

    // Combine prices with their respective products
    const productList = products.data.map((product) => {
      const price = prices.data.find((p) => p.product === product.id);
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        image: product.images?.[0] || '',
        priceId: price?.id,
        amount: price?.unit_amount,
        currency: price?.currency,
      };
    });

    return productList;
  }
  handleWebhook(rawBody: Buffer, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'STRIPE_WEBHOOK_SECRET',
    );
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret!,
      );
    } catch (err: any) {
      throw new InternalServerErrorException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status === 'paid') {
          const amount = session.amount_total;
          const email = session.customer_details?.email;

          console.log(`Payment received from user ${email}, amount: ${amount}`);
          // console.log('sessionData: ', session);
          //Update DB here
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }

  async createCheckoutSession(priceId: string): Promise<{
    url: string;
    line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    id: string;
  }> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: this.configService.get<string>('SUCCESS_URL')!,
      cancel_url: this.configService.get<string>('FAILURE_URL')!,
    });

    if (!session.url) {
      throw new InternalServerErrorException(
        'Stripe session URL not generated',
      );
    }

    return {
      url: session.url,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      id: session.id,
    };
  }
}
