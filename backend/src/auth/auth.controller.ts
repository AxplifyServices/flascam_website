import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import type {
  Request,
  Response,
} from 'express';

import {
  CurrentUser,
} from './decorators/current-user.decorator';

import {
  Public,
} from './decorators/public.decorator';

import {
  LoginDto,
} from './dto/login.dto';

import {
  AuthService,
} from './auth.service';

import type {
  AuthUser,
} from './types/auth-user.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService:
      AuthService,
  ) {}

  @Public()
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  @Post('login')
  login(
    @Body() dto: LoginDto,
    @Req() request: Request,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.login(
      dto,
      request,
      response,
    );
  }

  @Public()
  @Throttle({
    default: {
      limit: 20,
      ttl: 60_000,
    },
  })
  @Post('refresh')
  refresh(
    @Req() request: Request,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.refresh(
      request,
      response,
    );
  }

  @Post('logout')
  logout(
    @CurrentUser()
    user: AuthUser,
    @Req() request: Request,
    @Res({
      passthrough: true,
    })
    response: Response,
  ) {
    return this.authService.logout(
      user.id,
      request,
      response,
    );
  }

  @Get('me')
  me(
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.authService.me(
      user.id,
    );
  }
}