import { Body, Controller, NotAcceptableException, Post, Request } from '@nestjs/common';
import { BookingDto } from './dto/booking-dto';
import { BookingsService } from './bookings.service';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingsService) {}
  @Post('/')
  async BookAVehicle(@Body() body: BookingDto, @Request() req: any) {
    const toDate = new Date(body.toDate);
    const startDate = new Date(body.startDate);

    if( isNaN( toDate.getDate() ) || isNaN( startDate.getDate() ) ){
      throw new NotAcceptableException("Dates are not in the correct format.")
    }

    return this.bookingService.bookAVehicle(
      body.locationId,
      body.vehicleId,
      startDate,
      toDate,
      req.user,
      body.guestName,
      body.guestEmail,
    );
  }
}
