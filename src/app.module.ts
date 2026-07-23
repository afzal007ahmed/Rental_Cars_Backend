import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { config } from '../config/index';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { LocationModule } from './location/location.module';
import { AvailabilityModule } from './availability/availability.module';
import { VehicleModule } from './vehicle/vehicle.module';
import { ImagesModule } from './images/images.module';
import { BookingsModule } from './bookings/bookings.module';
import { CheckoutModule } from './checkout/checkout.module';
import { RedisModule } from './redis/redis.module';
import { EmailModule } from './email/email.module';
import { ProcessedEventsModule } from './processed-events/processed-events.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      uri: config.database.uri,
      dialect: 'postgres',
      autoLoadModels: true,
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    LocationModule,
    AvailabilityModule,
    VehicleModule,
    ImagesModule,
    BookingsModule,
    CheckoutModule,
    RedisModule,
    EmailModule,
    ProcessedEventsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('users' , 'bookings' , 'locations' , 'checkout');
  }
}
