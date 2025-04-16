import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Load environment variables
  const envPath =
    process.env.NODE_ENV === 'production'
      ? path.join(process.cwd(), '.env.production')
      : path.join(process.cwd(), '.env');

  dotenv.config({ path: envPath });

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
