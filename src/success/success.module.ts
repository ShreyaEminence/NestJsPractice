import { Module } from '@nestjs/common';
import { SuccessController } from '@success/success.controller';
import { SuccessService } from '@success/success.service';

@Module({
  controllers: [SuccessController],
  providers: [SuccessService]
})
export class SuccessModule {}
