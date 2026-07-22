import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { config } from './../config/index';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
  );

  app.enableCors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['*'],
  });

  await app.listen(config.server.port ?? 3000);

  setImmediate(async () => {
    NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
      transport: Transport.KAFKA,
      options: {
        client: { clientId: 'notification-service', ...config.kafka.clientOptions },
        consumer: { groupId: 'email-group' },
        subscribe: { fromBeginning: false },
      },
    }).then(consumer => consumer.listen()).catch(() => {});
  });
}

bootstrap();
