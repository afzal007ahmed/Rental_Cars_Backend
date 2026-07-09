import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bookings } from './models/bookings.model';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

@Module({
  imports: [SequelizeModule.forFeature([Bookings])],
  exports: [],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
