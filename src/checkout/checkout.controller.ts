import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CheckoutDto } from './dto/checkout-dto';
import { isValidDate } from 'src/utils/dateValidator';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Get('/:locationId/:vehicleId')
  async checkoutDetails(
    @Param('locationId') locationId: string,
    @Param('vehicleId') vehicleId: string,
    @Query() query: CheckoutDto,
    @Request() req: any,
  ) {
    const startDate = new Date(query.start_date);
    const endDate = new Date(query.to_date);

    if (!isValidDate(query.start_date) || !isValidDate(query.to_date)) {
      throw new BadRequestException('Dates are not in the correct format.');
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (query.start_date < todayStr) {
      throw new BadRequestException(
        'start_date must be today or in the future.',
      );
    }

    if (
      new Date(`${query.start_date}T${query.start_time}`) >=
      new Date(`${query.to_date}T${query.end_time}`)
    ) {
      throw new BadRequestException('start_date must be before to_date');
    }

    return this.checkoutService.checkoutDetails(
      locationId,
      vehicleId,
      startDate,
      endDate,
      query.start_date,
      query.to_date,
      query.start_time,
      query.end_time,
      query.lock_key,
      req.user,
    );
  }
}
