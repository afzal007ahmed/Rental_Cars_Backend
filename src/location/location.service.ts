import { Injectable, NotFoundException } from '@nestjs/common';
import { Location } from './models/location.model';
import { literal, Op } from 'sequelize';
import { Availability } from 'src/availability/models/availability.model';
import { Vehicle } from 'src/vehicle/models/vehicle.model';
import { Bookings } from 'src/bookings/models/bookings.model';
import { Images } from 'src/images/models/image.model';

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
    startDate: Date,
    toDate: Date,
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
        status : "inprogress"
      },
    });

    const unitsBookedPerVehicle = bookings.reduce((first, second) => {
      second = second.dataValues;
      if (!first[second.vehicle_id]) {
        first[second.vehicle_id] = 0;
      }
      if (second.start_date <= toDate && second.to_date >= startDate) {
        first[second.vehicle_id]++;
      }
      return first;
    }, {});

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
      const availabile_units =
        vehicle.units - (unitsBookedPerVehicle[vehicle.vehicle_id] || 0);
      data.status = availabile_units ? 'available' : 'sold_out';
      data.availabile_units = availabile_units;
      return data;
    });

    return { data: finalData, images: vehicleImageMap };
  }
}
