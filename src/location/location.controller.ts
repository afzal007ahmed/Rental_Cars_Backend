import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseFloatPipe,
  Query,
} from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
  @Get('/')
  async allLocations() {
    return await this.locationService.getAllLocations()
  }
  @Get('/range')
  async getAvailableVehiclesInThatRange(
    @Query('long', ParseFloatPipe) long: number,
    @Query('lat', ParseFloatPipe) lat: number,
  ) {
    return await this.locationService.findLocationInTheRange(long, lat);
  }
  @Get('/:id')
  async getVehiclesByLocationId(
    @Param('id') id: string,
    @Query('start_date') start_date: string,
    @Query('to_date') to_date: string,
    @Query('start_time') start_time: string,
    @Query('end_time') end_time: string,
  ) {
    const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!start_date || !to_date || !start_time || !end_time) {
      throw new BadRequestException('start_date, to_date, start_time and end_time are required.');
    }
    if (!TIME_REGEX.test(start_time) || !TIME_REGEX.test(end_time)) {
      throw new BadRequestException('time must be in HH:mm format (e.g. 09:00, 23:59)');
    }
    const startDate = new Date(start_date);
    const toDate = new Date(to_date);
    if (
      isNaN(toDate.getTime()) ||
      isNaN(startDate.getTime()) ||
      startDate >= toDate
    ) {
      throw new BadRequestException();
    }
    return this.locationService.findVehiclesAtALocation(
      id,
      start_date,
      to_date,
      start_time,
      end_time,
    );
  }
}
