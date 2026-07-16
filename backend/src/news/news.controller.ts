import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';

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

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

import {
  AdminNewsQueryDto,
} from './dto/admin-news-query.dto';

import {
  PublicNewsQueryDto,
} from './dto/public-news-query.dto';

import {
  UpdateNewsStatusDto,
} from './dto/update-news-status.dto';

import {
  UpsertNewsArticleDto,
} from './dto/upsert-news-article.dto';

import {
  NewsService,
} from './news.service';

import {
  ScheduleNewsPublicationDto,
} from './dto/schedule-news-publication.dto';

@Controller('news')
export class NewsController {
  constructor(
    private readonly service: NewsService,
  ) {}

  /*
   * Routes publiques
   */

  @Public()
  @Get('public')
  getPublicNews(
    @Query()
    query: PublicNewsQueryDto,
  ) {
    return this.service.getPublicNews(
      query,
    );
  }

  @Public()
  @Get('public/latest')
  getLatestPublicNews() {
    return this.service
      .getLatestPublicNews();
  }

  @Public()
  @Get('public/:slug')
  getPublicNewsBySlug(
    @Param('slug')
    slug: string,
  ) {
    return this.service
      .getPublicNewsBySlug(
        slug,
      );
  }

  /*
   * Administration FLASCAM
   */

  @Get('admin')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  getAdminNews(
    @Query()
    query: AdminNewsQueryDto,
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service.getAdminNews(
      query,
      user,
    );
  }

  @Get('admin/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  getAdminNewsById(
    @Param('id')
    id: string,
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service
      .getAdminNewsById(
        id,
        user,
      );
  }

  @Post('admin')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  createNews(
    @Body()
    dto: UpsertNewsArticleDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service.createNews(
      dto,
      user,
      request,
    );
  }

  @Put('admin/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  updateNews(
    @Param('id')
    id: string,
    @Body()
    dto: UpsertNewsArticleDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service.updateNews(
      id,
      dto,
      user,
      request,
    );
  }

  @Patch('admin/:id/status')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  updateNewsStatus(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateNewsStatusDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .updateNewsStatus(
        id,
        dto,
        user,
        request,
      );
  }

  @Patch('admin/:id/schedule')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  scheduleNewsPublication(
    @Param('id')
    id: string,
    @Body()
    dto: ScheduleNewsPublicationDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service.scheduleNewsPublication(
      id,
      dto,
      user,
      request,
    );
  }

  @Delete('admin/:id/schedule')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  cancelNewsPublicationSchedule(
    @Param('id')
    id: string,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service.cancelNewsPublicationSchedule(
      id,
      user,
      request,
    );
  }  

  @Delete('admin/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  deleteNews(
    @Param('id')
    id: string,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service.deleteNews(
      id,
      user,
      request,
    );
  }
}