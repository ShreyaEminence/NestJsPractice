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

  async createCheckoutSession(): Promise<{
    url: string;
    line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    id: string;
  }> {
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-Shirt',
            },
            unit_amount: 2000, // its in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
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
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'T-Shirt',
            },
            unit_amount: 2000, // its in cents
          },
          quantity: 1,
        },
      ],
      id: session.id,
    };
  }
}
