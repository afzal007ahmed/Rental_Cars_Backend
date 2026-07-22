import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { config } from '../../config';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CLIENT_KAFKA',
        transport: Transport.KAFKA,
        options: {
          client: { clientId: 'booking-service', ...config.kafka.clientOptions },
        },
      },
    ]),
  ],
  exports: [ClientsModule],
})
export class KafkaModule {}
