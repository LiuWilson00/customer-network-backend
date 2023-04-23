import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
// import {ValidationPipe} from '@nestjs/common';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({path: '.env.prod'});
} else {
  dotenv.config();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  await app.listen(process.env.PROT_SERVICE || 4000);
}
bootstrap();
