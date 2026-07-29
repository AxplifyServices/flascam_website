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
  AdminVideosQueryDto,
} from './dto/admin-videos-query.dto';

import {
  AssociationVideosQueryDto,
} from './dto/association-videos-query.dto';

import {
  PublicVideosQueryDto,
} from './dto/public-videos-query.dto';

import {
  RejectVideoDto,
} from './dto/reject-video.dto';

import {
  ScheduleVideoDto,
} from './dto/schedule-video.dto';

import {
  UpdateVideoStatusDto,
} from './dto/update-video-status.dto';

import {
  UpsertVideoDto,
} from './dto/upsert-video.dto';

import {
  VideosService,
} from './videos.service';

@Controller('videos')
export class VideosController {
  constructor(
    private readonly service: VideosService,
  ) {}

  /*
   * Routes publiques
   */

  @Public()
  @Get('public')
  getPublicVideos(
    @Query()
    query: PublicVideosQueryDto,
  ) {
    return this.service.getPublicVideos(
      query,
    );
  }

  @Public()
  @Get('public/featured')
  getFeaturedVideos() {
    return this.service.getFeaturedVideos();
  }

  @Public()
  @Get('public/association/:associationSlug')
  getAssociationPublicVideos(
    @Param('associationSlug')
    associationSlug: string,

    @Query()
    query: PublicVideosQueryDto,
  ) {
    return this.service.getAssociationPublicVideos(
      associationSlug,
      query,
    );
  }

  @Public()
  @Get('public/:slug')
  getPublicVideoBySlug(
    @Param('slug')
    slug: string,
  ) {
    return this.service.getPublicVideoBySlug(
      slug,
    );
  }

  /*
   * Vidéos de l’association connectée
   */

  @Get('association')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  getAssociationVideos(
    @Query()
    query: AssociationVideosQueryDto,

    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service.getAssociationVideos(
      query,
      user,
    );
  }

  @Get('association/:id')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  getAssociationVideoById(
    @Param('id')
    id: string,

    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service.getAssociationVideoById(
      id,
      user,
    );
  }

  @Post('association')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  createAssociationVideo(
    @Body()
    dto: UpsertVideoDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.createAssociationVideo(
      dto,
      user,
      request,
    );
  }

  @Put('association/:id')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  updateAssociationVideo(
    @Param('id')
    id: string,

    @Body()
    dto: UpsertVideoDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.updateAssociationVideo(
      id,
      dto,
      user,
      request,
    );
  }

  @Patch('association/:id/submit')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  submitAssociationVideo(
    @Param('id')
    id: string,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.submitAssociationVideo(
      id,
      user,
      request,
    );
  }

  @Patch('association/:id/unpublish')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  unpublishAssociationVideo(
    @Param('id')
    id: string,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.unpublishAssociationVideo(
      id,
      user,
      request,
    );
  }

  @Delete('association/:id')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  deleteAssociationVideo(
    @Param('id')
    id: string,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.deleteAssociationVideo(
      id,
      user,
      request,
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
  @Permissions('videos.manage')
  getAdminVideos(
    @Query()
    query: AdminVideosQueryDto,
  ) {
    return this.service.getAdminVideos(
      query,
    );
  }

  @Get('admin/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('videos.manage')
  getAdminVideoById(
    @Param('id')
    id: string,
  ) {
    return this.service.getAdminVideoById(
      id,
    );
  }

  @Post('admin')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('videos.manage')
  createAdminVideo(
    @Body()
    dto: UpsertVideoDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.createAdminVideo(
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
  @Permissions('videos.manage')
  updateAdminVideo(
    @Param('id')
    id: string,

    @Body()
    dto: UpsertVideoDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.updateAdminVideo(
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
  @Permissions('videos.manage')
  updateAdminVideoStatus(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateVideoStatusDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.updateAdminVideoStatus(
      id,
      dto,
      user,
      request,
    );
  }

  @Patch('admin/:id/approve')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('videos.manage')
  approveAssociationVideo(
    @Param('id')
    id: string,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.approveAssociationVideo(
      id,
      user,
      request,
    );
  }

  @Patch('admin/:id/reject')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('videos.manage')
  rejectAssociationVideo(
    @Param('id')
    id: string,

    @Body()
    dto: RejectVideoDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.rejectAssociationVideo(
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
  @Permissions('videos.manage')
  scheduleVideo(
    @Param('id')
    id: string,

    @Body()
    dto: ScheduleVideoDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.scheduleVideo(
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
  @Permissions('videos.manage')
  cancelVideoSchedule(
    @Param('id')
    id: string,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.cancelVideoSchedule(
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
  @Permissions('videos.manage')
  deleteAdminVideo(
    @Param('id')
    id: string,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.service.deleteAdminVideo(
      id,
      user,
      request,
    );
  }
}