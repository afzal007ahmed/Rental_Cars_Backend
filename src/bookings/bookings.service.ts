import {
  BadRequestException,
  ConflictException,
  GoneException,
  Inject,
  Injectable,
  NotAcceptableException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Op, Sequelize } from 'sequelize';
import { Availability } from 'src/availability/models/availability.model';
import { Location } from 'src/location/models/location.model';
import { Vehicle } from 'src/vehicle/models/vehicle.model';
import { Bookings } from './models/bookings.model';
import { User } from 'src/user/models/user.model';
import Redis from 'ioredis';
import { ClientKafka } from '@nestjs/microservices';
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
  start_time?: string;
  end_time?: string;
  drop_location_id?: string;
}

@Injectable()
export class BookingsService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly sequelize: Sequelize,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('CLIENT_KAFKA') private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit() {
    await this.kafka.connect();
  }
  async bookAVehicle(
    locationId: string,
    vehicleId: string,
    startDate: string,
    toDate: string,
    user: UserDataInterface,
    startTime: string,
    endTime: string,
    lock_key: string,
    guestName?: string,
    guestEmail?: string,
    dropLocationId?: string,
  ) {
    // validate lock before opening transaction
    const lock = await this.redis.ttl(lock_key);
    if (lock === -2) {
      throw new GoneException('Session expired. Please go back to checkout.');
    }

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
          [Op.and]: [
            Sequelize.literal(
              `(start_date::date + start_time::time) <= ('${toDate}'::date + '${endTime}'::time)`,
            ),
            Sequelize.literal(
              `(to_date::date + end_time::time) >= ('${startDate}'::date + '${startTime}'::time)`,
            ),
          ],
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
        (new Date(toDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24);

      const totalPrice = days * isVehicleExists.dataValues.price;

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
          ...(dropLocationId && { drop_location_id: dropLocationId }),
          status: 'inprogress',
          start_time: startTime,
          end_time: endTime,
          vehicle_price: isVehicleExists.dataValues.price,
        },
        { transaction },
      );
      await transaction.commit();
      await this.redis.del(lock_key);
      this.kafka.emit('booking-completed', {
        booking_id: booking.dataValues.id,
      });
      return {
        success: true,
        id: booking.dataValues.id,
      };
    } catch (error) {
      await this.redis.del(lock_key);
      await transaction.rollback();
      throw error;
    }
  }
  async getABooking(id: string) {
    const isBookingExists = await Bookings.findOne({
      where: { id: id },
      include: [
        { model: Location, as: 'pickupLocation' },
        { model: Location, as: 'dropLocation' },
        { model: Vehicle },
        { model: User },
      ],
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
        { model: Location, as: 'pickupLocation' },
        { model: Location, as: 'dropLocation' },
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
        'Booking not found/ Booking is not of this user or not in inprogress.',
      );
    }

    const booking = isBookingExists.dataValues;

    const effectiveStartDate = data.start_date ?? booking.start_date;
    const effectiveEndDate = data.end_date ?? booking.to_date;
    const effectiveStartTime = data.start_time ?? booking.start_time;
    const effectiveEndTime = data.end_time ?? booking.end_time;

    if (new Date(booking.start_date) <= new Date()) {
      throw new BadRequestException(
        'This booking has already started and cannot be modified.',
      );
    }

    if (data.start_date && new Date(data.start_date) <= new Date()) {
      throw new BadRequestException('start_date must be in the future.');
    }

    if (new Date(effectiveStartDate) >= new Date(effectiveEndDate)) {
      throw new BadRequestException('start_date must be before end_date.');
    }

    const availability = await Availability.findOne({
      where: {
        vehicle_id: booking.vehicle_id,
        location_id: booking.location_id,
      },
    });
    if (!availability) {
      throw new BadRequestException(
        'Vehicle is not available at this location.',
      );
    }

    const overlappingBookings = await Bookings.findAll({
      where: {
        id: { [Op.ne]: id },
        location_id: booking.location_id,
        vehicle_id: booking.vehicle_id,
        status: 'inprogress',
        [Op.and]: [
          Sequelize.literal(
            `(start_date::date + start_time::time) <= ('${effectiveEndDate}'::date + '${effectiveEndTime}'::time)`,
          ),
          Sequelize.literal(
            `(to_date::date + end_time::time) > ('${effectiveStartDate}'::date + '${effectiveStartTime}'::time)`,
          ),
        ],
      },
    });

    if (availability.dataValues.units <= overlappingBookings.length) {
      throw new ConflictException(
        'No units available for the updated time slot.',
      );
    }

    const days =
      (new Date(effectiveEndDate).getTime() -
        new Date(effectiveStartDate).getTime()) /
      (1000 * 60 * 60 * 24);
    const totalPrice = days * booking.vehicle_price;

    await Bookings.update(
      { ...data, to_date: data.end_date, total_price: totalPrice },
      { where: { id: id, user_id: user.id } },
    );
    return { success: true };
  }
}
