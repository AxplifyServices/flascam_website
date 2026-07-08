import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import type {
  Request,
} from 'express';

import {
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator';

import {
  Public,
} from '../auth/decorators/public.decorator';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

import {
  CreateContactMessageDto,
} from './dto/create-contact-message.dto';

import {
  UpdateContactStatusDto,
} from './dto/update-contact-status.dto';

import {
  UpdateInstitutionalContentDto,
} from './dto/update-institutional-content.dto';

import {
  InstitutionalService,
} from './institutional.service';

@Controller('institutional')
export class InstitutionalController {
  constructor(
    private readonly service:
      InstitutionalService,
  ) {}

  @Public()
  @Get('public')
  getPublicContent() {
    return this.service
      .getPublicContent();
  }

  @Public()
  @Throttle({
    default: {
      limit: 5,
      ttl: 60_000,
    },
  })
  @Post('contact')
  createContactMessage(
    @Body()
    dto: CreateContactMessageDto,
    @Req()
    request: Request,
  ) {
    return this.service
      .createContactMessage(
        dto,
        request,
      );
  }

  @Get('admin')
  @Permissions('content.manage')
  getAdminContent() {
    return this.service
      .getAdminContent();
  }

  @Put('admin')
  @Permissions('content.manage')
  updateContent(
    @Body()
    dto:
      UpdateInstitutionalContentDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .updateContent(
        dto,
        user,
        request,
      );
  }

  @Get('contact-messages')
  @Permissions('content.manage')
  getContactMessages() {
    return this.service
      .getContactMessages();
  }

  @Patch(
    'contact-messages/:id/status',
  )
  @Permissions('content.manage')
  updateContactStatus(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateContactStatusDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .updateContactStatus(
        id,
        dto,
        user,
        request,
      );
  }
}