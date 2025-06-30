import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { StripeService } from '@stripe/stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.stripeService.handleWebhook(req.body, signature);
  }

  @Post('checkout')
  async createCheckoutSession(@Res() res: Response) {
    const result = await this.stripeService.createCheckoutSession();

    if (result.url) {
      return res.json({ url: result.url });
    }

    return res
      .status(400)
      .json({ success: false, message: 'Failed to create session' });
  }
}
