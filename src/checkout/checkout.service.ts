import {
  BadRequestException,
  ConflictException,
  GoneException,
  Inject,
  Injectable,
} from '@nestjs/common';
import Redis from 'ioredis';
import { Op, Sequelize } from 'sequelize';
import { Availability } from 'src/availability/models/availability.model';
import { Bookings } from 'src/bookings/models/bookings.model';
import { Images } from 'src/images/models/image.model';
import { Location } from 'src/location/models/location.model';
import { Vehicle } from 'src/vehicle/models/vehicle.model';

@Injectable()
export class CheckoutService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async checkoutDetails(
    locationId: string,
    vehicleId: string,
    startDate: Date,
    endDate: Date,
    startDateStr: string,
    toDateStr: string,
    startTime: string,
    endTime: string,
    lock_key?: string,
  ) {
    const isVehicleExists = await Vehicle.findOne({ where: { id: vehicleId } });
    if (!isVehicleExists) {
      throw new BadRequestException('Vehicle not found');
    }

    const isLocationExists = await Location.findOne({
      where: { id: locationId },
    });
    if (!isLocationExists) {
      throw new BadRequestException('Location not found');
    }

    const days =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    const checkoutData = await Availability.findOne({
      where: { vehicle_id: vehicleId, location_id: locationId },
      include: [{ model: Vehicle, include: [Images] }],
    });

    const costOfVehicle = checkoutData?.dataValues.vehicle.dataValues.price;

    if (lock_key) {
      const ttl = await this.redis.ttl(lock_key);
      if (ttl === -2) {
        throw new GoneException(
          'Checkout session expired. Please go back and try again.',
        );
      }
      return {
        data: {
          ...checkoutData?.dataValues,
          pickup: isLocationExists.dataValues,
        },
        lock_key: lock_key,
        lock_expires_at: new Date(Date.now() + ttl * 1000).toISOString(),
        total_amount: days * costOfVehicle,
      };
    }

    // get total units for this vehicle at this location
    const availability = await Availability.findOne({
      where: { vehicle_id: vehicleId, location_id: locationId },
    });
    if (!availability) {
      throw new BadRequestException(
        'Vehicle is not available at this location.',
      );
    }
    const totalUnits = availability.dataValues.units;

    // count overlapping bookings
    const overlappingBookings = await Bookings.findAll({
      where: {
        location_id: locationId,
        vehicle_id: vehicleId,
        status: 'inprogress',
        [Op.and]: [
          Sequelize.literal(
            `(start_date::date + start_time::time) <= ('${toDateStr}'::date + '${endTime}'::time)`,
          ),
          Sequelize.literal(
            `(to_date::date + end_time::time) >= ('${startDateStr}'::date + '${startTime}'::time)`,
          ),
        ],
      },
    });

    // count overlapping Redis locks
    const lockPattern = `${locationId}:${vehicleId}:*`;
    const allLockKeys: string[] = [];
    let cursor = '0';
    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        lockPattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      allLockKeys.push(...keys);
    } while (cursor !== '0');

    const requestedStart = new Date(`${startDateStr}T${startTime}`);
    const requestedEnd = new Date(`${toDateStr}T${endTime}`);
    let redisLockCount = 0;

    for (const k of allLockKeys) {
      const raw = await this.redis.get(k);
      if (!raw) continue;
      const { startDateTime, endDateTime } = JSON.parse(raw);
      const lockedStart = new Date(startDateTime);
      const lockedEnd = new Date(endDateTime);
      if (lockedStart < requestedEnd && lockedEnd > requestedStart) {
        redisLockCount++;
      }
    }

    //check if slot is full
    if (overlappingBookings.length + redisLockCount >= totalUnits) {
      throw new ConflictException('No units available for this time slot.');
    }

    //set new lock with 5 min TTL
    const newKey = `${locationId}:${vehicleId}:${Date.now()}`;
    const value = JSON.stringify({
      vehicleId,
      startDateTime: `${startDateStr}T${startTime}`,
      endDateTime: `${toDateStr}T${endTime}`,
    });
    await this.redis.set(newKey, value, 'EX', 300);

    return {
      data: {
        ...checkoutData?.dataValues,
        pickup: isLocationExists.dataValues,
      },
      lock_key: newKey,
      lock_expires_at: new Date(Date.now() + 300 * 1000).toISOString(),
      total_amount: days * costOfVehicle,
    };
  }
}
