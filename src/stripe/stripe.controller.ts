import {
  Controller,
  Get,
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

  @Get('products')
  getProducts() {
    return this.stripeService.getProductsWithPrices();
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.stripeService.handleWebhook(req.body, signature);
  }

  @Post('checkout')
  async createCheckoutSession(@Req() req: Request, @Res() res: Response) {
    const result = await this.stripeService.createCheckoutSession(
      req.body.priceId,
    );

    if (result.url) {
      return res.json({
        url: result.url,
        line_items: result.line_items,
        id: result.id,
      });
    }

    return res
      .status(400)
      .json({ success: false, message: 'Failed to create session' });
  }
  // @Post('create-free-plan')
  // async createFreePlan() {
  //   return this.stripeService.createFreePlanProduct();
  // }
}
