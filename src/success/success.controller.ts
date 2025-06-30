import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('success')
export class SuccessController {
  @Get()
  onSuccess(@Res() res: Response) {
    return res.status(200).json({
      success: true,
      message: 'Payment successful!',
    });
  }
}
