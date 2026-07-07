import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix('api');
  await app.listen(3001, '0.0.0.0');
  console.log('Backend démarré sur http://localhost:3001/api');
}

bootstrap();