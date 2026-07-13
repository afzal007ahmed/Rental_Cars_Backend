import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Availability } from 'src/availability/models/availability.model';
import { Location } from 'src/location/models/location.model';
import { Vehicle } from 'src/vehicle/models/vehicle.model';
import { Bookings } from './models/bookings.model';
import { User } from 'src/user/models/user.model';
interface UserDataInterface {
  guest: boolean;
  id: string;
}

interface BookingUpdateInterface {
  vehicle_id?: string;
  start_date?: string;
  end_date?: string;
  guest_name?: string;
  guest_email?: string;
}

@Injectable()
export class BookingsService {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}
  async bookAVehicle(
    locationId: string,
    vehicleId: string,
    startDate: string,
    toDate: string,
    user: UserDataInterface,
    guestName?: string,
    guestEmail?: string,
  ) {
    const transaction = await this.sequelize.transaction();

    try {
      if (user.guest && (!guestEmail || !guestName)) {
        throw new NotAcceptableException('Please provide name and email.');
      }
      const isLocationExists = await Location.findOne({
        where: { id: locationId },
      });
      if (!isLocationExists) {
        throw new BadRequestException('Location does not exists');
      }
      const isVehicleExists = await Vehicle.findOne({
        where: { id: vehicleId },
      });
      if (!isVehicleExists) {
        throw new BadRequestException('Vehicle does not exists');
      }

      // lock the row for race conditions
      const availability = await Availability.findOne({
        where: { vehicle_id: vehicleId, location_id: locationId },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      //all booking which are overlapping
      const allBookings = await Bookings.findAll({
        where: {
          location_id: locationId,
          vehicle_id: vehicleId,
          status: 'inprogress',
          to_date: { [Op.gte]: startDate },
          start_date: { [Op.lte]: toDate },
        },
        transaction,
      });

      if (!availability) {
        throw new BadRequestException(
          'Vehicle is not available at this location.',
        );
      }

      if (availability.dataValues.units <= allBookings.length) {
        throw new ConflictException(
          'This vehicle is not available for the selected time slot.',
        );
      }
      const days =
        (new Date(toDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);

      const totalPrice = days * isVehicleExists.dataValues.price;
      console.log( toDate , startDate)
      const booking = await Bookings.create(
        {
          total_price: totalPrice,
          location_id: locationId,
          vehicle_id: vehicleId,
          to_date: toDate,
          start_date: startDate,
          ...(user.guest && {
            guest_name: guestName,
            guest_email: guestEmail,
          }),
          ...(!user.guest && { user_id: user.id }),
          status: 'inprogress',
        },
        { transaction },
      );
      await transaction.commit();
      return {
        success: true,
        id: booking.dataValues.id,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  async getABooking(id: string) {
    const isBookingExists = await Bookings.findOne({
      where: { id: id },
      include: [{ model: Location }, { model: Vehicle }, { model: User }],
    });
    if (!isBookingExists) {
      throw new NotFoundException('Booking not found.');
    }
    return isBookingExists;
  }
  async getAllBookingsOfAUser(id: string) {
    const isUserExists = await User.findOne({
      where: { id: id, guest: false },
    });
    if (!isUserExists) {
      throw new NotFoundException('User not found.');
    }
    const bookings = await Bookings.findAll({
      where: { user_id: id },
      include: [
        { model: Location },
        { model: Vehicle },
        { model: User, attributes: ['name', 'email', 'id', 'guest'] },
      ],
    });
    return bookings;
  }
  async cancelBooking(id: string) {
    const isBookingExists = await Bookings.findOne({ where: { id: id } });
    if (!isBookingExists) {
      throw new NotFoundException('Booking not found');
    }
    if (isBookingExists.dataValues.status === 'cancelled') {
      throw new ConflictException('Booking is already cancelled.');
    }
    await Bookings.update({ status: 'cancelled' }, { where: { id: id } });
    return {
      success: true,
    };
  }
  async updateBookingBytId(
    user: UserDataInterface,
    id: string,
    data: BookingUpdateInterface,
  ) {
    const isBookingExists = await Bookings.findOne({
      where: { id: id, user_id: user.id, status: 'inprogress' },
    });
    if (!isBookingExists) {
      throw new NotFoundException(
        'Booking not found/ Booking is not of this user.',
      );
    }

    await Bookings.update({ ...data }, { where: { id: id, user_id: user.id } });
    return { success: true };
  }
}
