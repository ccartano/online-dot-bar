import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Load environment variables
  const envPath = process.env.NODE_ENV === 'production' 
    ? path.join(process.cwd(), '.env.production')
    : path.join(process.cwd(), '.env');
  
  const envConfig = dotenv.config({ path: envPath });
  if (envConfig.error) {
    logger.error('Error loading .env file:', envConfig.error);
  } else {
    logger.log(`Environment file loaded from: ${envPath}`);
  }
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Set global prefix for all routes
    app.setGlobalPrefix('api');

    // Enable CORS
    app.enableCors({
      origin: 'http://localhost:5173', // Your frontend URL
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
  } catch (error) {
    logger.error('Error during application startup:', error);
    process.exit(1);
  }
}

bootstrap();
