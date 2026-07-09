import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bookings } from './models/bookings.model';

@Module({
  imports: [SequelizeModule.forFeature([Bookings])],
  exports: [],
  providers: [],
  controllers: [],
})
export class BookingsModule {}
