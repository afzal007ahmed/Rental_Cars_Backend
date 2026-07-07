import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Location } from './models/location.model';

@Module({
  imports: [SequelizeModule.forFeature([Location])],
  providers: [],
  exports: [],
  controllers: [],
})
export class LocationModule {}
