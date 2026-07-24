import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Bookings } from './models/bookings.model';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { RedisModule } from 'src/redis/redis.module';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [SequelizeModule.forFeature([Bookings]), RedisModule, KafkaModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
