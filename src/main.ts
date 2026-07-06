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
    }),
  );
  await app.listen(config.server.port ?? 3000);
}
bootstrap();
