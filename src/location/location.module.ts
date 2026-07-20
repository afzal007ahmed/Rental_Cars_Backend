import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Location } from './models/location.model';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [SequelizeModule.forFeature([Location]), RedisModule],
  providers: [LocationService],
  controllers: [LocationController],
})
export class LocationModule {}
