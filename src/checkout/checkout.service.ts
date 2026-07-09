import { BadRequestException, Injectable } from '@nestjs/common';
import { Availability } from 'src/availability/models/availability.model';
import { Images } from 'src/images/models/image.model';
import { Location } from 'src/location/models/location.model';
import { Vehicle } from 'src/vehicle/models/vehicle.model';

@Injectable()
export class CheckoutService {
  async checkoutDetails(
    locationId: string,
    vehicleId: string,
    startDate: Date,
    endDate: Date,
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
    const checkoutData = await Availability.findOne({
      where: { vehicle_id: vehicleId, location_id: locationId },
      include: [{ model: Vehicle, include: [Images] }],
    });

    const days =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const costOfVehicle = checkoutData?.dataValues.vehicle.dataValues.price;
    return {
      data: {...checkoutData?.dataValues , pickup : isLocationExists.dataValues },
      total_amount: days * costOfVehicle
    };
  }
}
