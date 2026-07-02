import {
  ValidationPipe,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  NestFactory,
} from '@nestjs/core';

import cookieParser
  from 'cookie-parser';

import helmet
  from 'helmet';

import {
  AppModule,
} from './app.module';

async function bootstrap() {
  const app =
    await NestFactory.create(
      AppModule,
    );

  const config =
    app.get(ConfigService);

  app.setGlobalPrefix(
    config.get<string>(
      'API_PREFIX',
      'api',
    ),
  );

  app.use(cookieParser());

  app.use(helmet());

  app.enableCors({
    origin:
      config
        .get<string>(
          'CORS_ORIGINS',
          'http://localhost:3001',
        )
        .split(',')
        .map(
          (origin) =>
            origin.trim(),
        ),
    credentials: true,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
    allowedHeaders: [
      'Content-Type',
      'Accept',
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted:
        true,
      transform: true,
    }),
  );

  await app.listen(
    config.get<number>(
      'PORT',
      3000,
    ),
  );
}

void bootstrap();