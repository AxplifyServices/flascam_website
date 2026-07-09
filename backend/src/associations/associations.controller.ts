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
  AssociationsService,
} from './associations.service';

import {
  UpdateAssociationPostStatusDto,
} from './dto/update-association-post-status.dto';

import {
  UpdateAssociationStatusDto,
} from './dto/update-association-status.dto';

import {
  UpsertAssociationDto,
} from './dto/upsert-association.dto';

import {
  UpsertAssociationMediaDto,
} from './dto/upsert-association-media.dto';

import {
  UpsertAssociationPostDto,
} from './dto/upsert-association-post.dto';

@Controller('associations')
export class AssociationsController {
  constructor(
    private readonly service:
      AssociationsService,
  ) {}

  @Public()
  @Get('public')
  getPublicAssociations() {
    return this.service
      .getPublicAssociations();
  }

  @Public()
  @Get('public/featured')
  getFeaturedAssociations() {
    return this.service
      .getFeaturedAssociations();
  }

  @Public()
  @Get('public/:slug')
  getPublicAssociationBySlug(
    @Param('slug')
    slug: string,
  ) {
    return this.service
      .getPublicAssociationBySlug(
        slug,
      );
  }

  @Get('admin')
  @Permissions('associations.read')
  getAdminAssociations(
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service
      .getAdminAssociations(user);
  }

  @Get('admin/:id')
  @Permissions('associations.read')
  getAdminAssociation(
    @Param('id')
    id: string,
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service
      .getAdminAssociation(
        id,
        user,
      );
  }

  @Post('admin')
  @Permissions('associations.manage')
  createAssociation(
    @Body()
    dto: UpsertAssociationDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .createAssociation(
        dto,
        user,
        request,
      );
  }

  @Put('admin/:id')
  @Permissions('associations.manage')
  updateAssociation(
    @Param('id')
    id: string,
    @Body()
    dto: UpsertAssociationDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .updateAssociation(
        id,
        dto,
        user,
        request,
      );
  }

  @Patch('admin/:id/status')
  @Permissions('associations.manage')
  updateAssociationStatus(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateAssociationStatusDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .updateAssociationStatus(
        id,
        dto,
        user,
        request,
      );
  }

  @Post('admin/:associationId/posts')
  @Permissions('associations.manage')
  createPost(
    @Param('associationId')
    associationId: string,
    @Body()
    dto: UpsertAssociationPostDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service.upsertPost(
      associationId,
      null,
      dto,
      user,
      request,
    );
  }

  @Put('admin/:associationId/posts/:postId')
  @Permissions('associations.manage')
  updatePost(
    @Param('associationId')
    associationId: string,
    @Param('postId')
    postId: string,
    @Body()
    dto: UpsertAssociationPostDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service.upsertPost(
      associationId,
      postId,
      dto,
      user,
      request,
    );
  }

  @Patch('admin/:associationId/posts/:postId/status')
  @Permissions('associations.manage')
  updatePostStatus(
    @Param('associationId')
    associationId: string,
    @Param('postId')
    postId: string,
    @Body()
    dto: UpdateAssociationPostStatusDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .updatePostStatus(
        associationId,
        postId,
        dto,
        user,
        request,
      );
  }

  @Post('admin/:associationId/media')
  @Permissions('associations.manage')
  createMediaItem(
    @Param('associationId')
    associationId: string,
    @Body()
    dto: UpsertAssociationMediaDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .upsertMediaItem(
        associationId,
        null,
        dto,
        user,
        request,
      );
  }

  @Put('admin/:associationId/media/:mediaItemId')
  @Permissions('associations.manage')
  updateMediaItem(
    @Param('associationId')
    associationId: string,
    @Param('mediaItemId')
    mediaItemId: string,
    @Body()
    dto: UpsertAssociationMediaDto,
    @CurrentUser()
    user: AuthUser,
    @Req()
    request: Request,
  ) {
    return this.service
      .upsertMediaItem(
        associationId,
        mediaItemId,
        dto,
        user,
        request,
      );
  }
}