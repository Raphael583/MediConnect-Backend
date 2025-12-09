import * as dotenv from 'dotenv';
dotenv.config();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  
  await app.listen(process.env.PORT ?? 3000);
  
  
}
bootstrap();
