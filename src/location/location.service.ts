import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Location } from './models/location.model';
import { literal, Op } from 'sequelize';
import { Availability } from 'src/availability/models/availability.model';
import { Vehicle } from 'src/vehicle/models/vehicle.model';
import { Bookings } from 'src/bookings/models/bookings.model';
import { Images } from 'src/images/models/image.model';
import Redis from 'ioredis';

function findDistanceQuery(long: number, lat: number) {
  return ` (
            6371 * acos(
              cos(radians(${lat}))
              * cos(radians(lat))
              * cos(radians(long) - radians(${long}))
              + sin(radians(${lat}))
              * sin(radians(lat))
            )
          )`;
}

@Injectable()
export class LocationService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}
  async getAllLocations() {
    return await Location.findAll();
  }
  async findLocationInTheRange(long: number, lat: number) {
    const range = 50;
    const distanceQuery = findDistanceQuery(long, lat);
    const locationsDataInRange = await Location.findAll({
      attributes: {
        include: [[literal(distanceQuery), 'distance']],
      },
      where: literal(`${distanceQuery} <= ${range}`),
      order: literal('distance ASC'),
    });
    return locationsDataInRange;
  }
  async findVehiclesAtALocation(
    locationId: string,
    startDate: string,
    toDate: string,
    start_time: string,
    end_time: string,
  ) {
    const isLocationPresent = await Location.findOne({
      where: { id: locationId },
    });

    //location check
    if (!isLocationPresent) {
      throw new NotFoundException('Location not found');
    }

    const vehiclesData = await Availability.findAll({
      where: { location_id: locationId },
      include: [{ model: Vehicle }],
    });

    const allVehicleIds = vehiclesData.reduce(
      (first: string[], second: Availability) => {
        second = second.dataValues;
        if (!first.includes(second.vehicle_id)) {
          first.push(second.vehicle_id);
        }
        return first;
      },
      [],
    );
    const bookings = await Bookings.findAll({
      where: {
        location_id: locationId,
        vehicle_id: { [Op.in]: allVehicleIds },
        status: 'inprogress',
      },
    });

    const allHoldBookings: string[] = [];

    for (const vid of allVehicleIds) {
      const pattern = `${locationId}:${vid}:*`;
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        allHoldBookings.push(...keys);
      } while (cursor !== '0');
    }

    const unitsBookedPerVehicle = bookings.reduce(
      (first, second) => {
        second = second.dataValues;

        if (!first[second.vehicle_id]) {
          first[second.vehicle_id] = 0;
        }
        const existingStart = new Date(
          `${second.start_date}T${second.start_time}`,
        );
        const existingEnd = new Date(`${second.to_date}T${second.end_time}`);
        const requestedStart = new Date(`${startDate}T${start_time}`);
        const requestedEnd = new Date(`${toDate}T${end_time}`);

        if (existingStart <= requestedEnd && existingEnd >= requestedStart) {
          first[second.vehicle_id]++;
        }

        return first;
      },
      {} as Record<string, number>,
    );

    // count redis locked timeslots that overlap with the requested range
    const requestedStart = new Date(`${startDate}T${start_time}`);
    const requestedEnd = new Date(`${toDate}T${end_time}`);

    for (const key of allHoldBookings) {
      const raw = await this.redis.get(key);
      if (!raw) continue;
      const { startDateTime, endDateTime, vehicleId } = JSON.parse(raw);
      const lockedStart = new Date(startDateTime);
      const lockedEnd = new Date(endDateTime);
      if (lockedStart <= requestedEnd && lockedEnd >= requestedStart) {
        unitsBookedPerVehicle[vehicleId] =
          (unitsBookedPerVehicle[vehicleId] || 0) + 1;
      }
    }

    const vehicleImages = await Images.findAll({
      where: { vehicle_id: { [Op.in]: allVehicleIds } },
    });
    const vehicleImageMap = vehicleImages.reduce((first, second) => {
      second = second.dataValues;
      if (!first[second.vehicle_id]) {
        first[second.vehicle_id] = [];
      }
      first[second.vehicle_id].push(second.image);
      return first;
    }, {});
    const finalData = vehiclesData.map((vehicle) => {
      vehicle = vehicle.dataValues;
      const data: any = { ...vehicle };
      const available_units =
        vehicle.units - (unitsBookedPerVehicle[vehicle.vehicle_id] || 0);
      data.status = available_units ? 'available' : 'sold_out';
      data.available_units = available_units;
      return data;
    });

    return { data: finalData, images: vehicleImageMap };
  }
}
