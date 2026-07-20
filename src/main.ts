import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './../config/index';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted : true 
    }),
  );
  app.enableCors({
    origin: config.cors.origin,
    credential: true,
    methods: ['*'],
  });
  await app.listen(config.server.port ?? 3000);
}
bootstrap();
