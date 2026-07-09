import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}
  @Get('/:locationId/:vehicleId')
  async checkoutDetails(
    @Param('locationId') locationId: string,
    @Param('vehicleId') vehicleId: string,
    @Query('start_date') startDate: Date,
    @Query('to_date') endDate: Date,
  ) {
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    if (
      isNaN(startDate.getDate()) ||
      isNaN(endDate.getDate()) ||
      startDate >= endDate
    ) {
      throw new BadRequestException();
    }
    return this.checkoutService.checkoutDetails(
      locationId,
      vehicleId,
      startDate,
      endDate,
    );
  }
}
