import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vehicle } from './models/vehicle.model';

@Module({
  imports: [SequelizeModule.forFeature([Vehicle])],
})
export class VehicleModule {}
