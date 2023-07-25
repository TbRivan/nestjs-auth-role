import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // To run validator on every request that have been define in dto
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3001);
}
bootstrap();
