import { Module } from '@nestjs/common';

import {
  APP_GUARD,
} from '@nestjs/core';

import {
  ConfigModule,
} from '@nestjs/config';

import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

import {
  AppController,
} from './app.controller';

import {
  AppService,
} from './app.service';

import {
  AuditLogsModule,
} from './audit-logs/audit-logs.module';

import {
  AuthModule,
} from './auth/auth.module';

import {
  JwtAuthGuard,
} from './auth/guards/jwt-auth.guard';

import {
  PermissionsGuard,
} from './auth/guards/permissions.guard';

import {
  RolesGuard,
} from './auth/guards/roles.guard';

import {
  PermissionsModule,
} from './permissions/permissions.module';

import {
  PrismaModule,
} from './prisma/prisma.module';

import {
  RolesModule,
} from './roles/roles.module';

import {
  UsersModule,
} from './users/users.module';

import {
  InstitutionalModule,
} from './institutional/institutional.module';

import {
  AssociationsModule,
} from './associations/associations.module';

import {
  MediaModule,
} from './media/media.module';

import {
  HomepageHeroModule,
} from './homepage-hero/homepage-hero.module';

import {
  NewsModule,
} from './news/news.module';

import {
  ScheduleModule,
} from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),

    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),

    PrismaModule,
    AuditLogsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    InstitutionalModule,
    AssociationsModule,
    MediaModule,
    HomepageHeroModule,
    NewsModule,
  ],
  controllers: [
    AppController,
  ],
  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass:
        ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass:
        JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass:
        RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass:
        PermissionsGuard,
    },
  ],
})
export class AppModule {}