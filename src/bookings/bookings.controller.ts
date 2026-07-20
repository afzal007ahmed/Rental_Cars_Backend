import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotAcceptableException,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { BookingDto } from './dto/booking-dto';
import { BookingsService } from './bookings.service';
import { BookingUpdateDto } from './dto/booking-update-dto';
import { isValidDate } from 'src/utils/dateValidator';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingsService) {}
  @Post('/')
  async bookAVehicle(@Body() body: BookingDto, @Request() req: any) {
    const to_date = new Date(body.toDate);
    const start_date = new Date(body.startDate);

    if (!isValidDate(body.toDate) || !isValidDate(body.startDate)) {
      throw new NotAcceptableException('Dates are not in the correct format.');
    }
    if (start_date >= to_date) {
      throw new BadRequestException("It's not a valid range.");
    }

    return await this.bookingService.bookAVehicle(
      body.locationId,
      body.vehicleId,
      body.startDate,
      body.toDate,
      req.user,
      body.start_time,
      body.end_time,
      body.lock_key,
      body.guestName,
      body.guestEmail,
      body.drop_location_id,
    );
  }

  @Get('/all')
  async getBookingsOfAUser(@Request() req: any) {
    if (req.user.guest) {
      throw new BadRequestException('Please make account to see your bookings');
    }
    return this.bookingService.getAllBookingsOfAUser(req.user.id);
  }
  @Get('/:id')
  async getBookingById(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Please send a valid booking id.');
    }
    return await this.bookingService.getABooking(id);
  }
  @Delete('/:id')
  async cancelBooking(@Param('id') id: string) {
    return await this.bookingService.cancelBooking(id);
  }
  @Patch('/:id')
  async updateBookingById(
    @Request() req: any,
    @Param('id') id: string,
    @Body() data: BookingUpdateDto,
  ) {
    let start_date: string = data.start_date;
    let end_date: string = data.end_date;

    if (start_date) {
      if (!isValidDate(start_date)) {
        throw new BadRequestException('Start date is invalid');
      }
    }
    if (end_date) {
      if (!isValidDate(end_date)) {
        throw new BadRequestException('end date is invalid');
      }
    }

    return await this.bookingService.updateBookingBytId(req.user, id, data);
  }
}
