import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseDatePipe,
  ParseFloatPipe,
  Query,
} from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
  @Get('')
  async getAvailableVehiclesInThatRange(
    @Query('long', ParseFloatPipe) long: number,
    @Query('lat', ParseFloatPipe) lat: number,
  ) {
    return await this.locationService.findLocationInTheRange(long, lat);
  }
  @Get('/:id')
  async getVehiclesByLocationId(
    @Param('id') id: string,
    @Query('start_date') startDate: Date,
    @Query('to_date') toDate: Date,
  ) {
    startDate = new Date(startDate);
    toDate = new Date(toDate);
    if ((isNaN(toDate.getDate()) || isNaN(startDate.getDate())) || ( startDate >= toDate)) {
      throw new BadRequestException();
    }
    return this.locationService.findVehiclesAtALocation(id, startDate, toDate);
  }
}
