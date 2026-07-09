import { Module } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';

@Module({
  imports: [],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [],
})
export class CheckoutModule {}
