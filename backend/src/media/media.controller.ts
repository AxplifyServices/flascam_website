import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';

import {
  FileInterceptor,
} from '@nestjs/platform-express';

import {
  memoryStorage,
} from 'multer';

import {
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

import {
  MediaService,
} from './media.service';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

@Controller('media')
export class MediaController {
  constructor(
    private readonly service: MediaService,
  ) {}

  @Post('admin/images')
  @Permissions('associations.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize:
          10 * 1024 * 1024,
      },
    }),
  )
  uploadAdminImage(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service
      .uploadPublicImage(
        file,
        user,
      );
  }

  @Post('association/images')
  @Permissions('association.media.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize:
          10 * 1024 * 1024,
      },
    }),
  )
  uploadAssociationImage(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service.uploadPublicImage(
      file,
      user,
      `associations/${user.id}`,
    );
  }  

  @Post('admin/homepage-images')
  @Permissions('homepage.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize:
          10 * 1024 * 1024,
      },
    }),
  )
  uploadHomepageImage(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service.uploadPublicImage(
      file,
      user,
      'homepage/hero',
    );
  }

  @Post('admin/news-media')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize:
          100 * 1024 * 1024,
      },
    }),
  )
  uploadNewsMedia(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service.uploadPublicNewsMedia(
      file,
      user,
    );
  }  
  @Post('association/news-media')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.media.manage',
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage:
        memoryStorage(),

      limits: {
        fileSize:
          100 *
          1024 *
          1024,
      },
    }),
  )
  uploadAssociationNewsMedia(
    @UploadedFile()
    file: Express.Multer.File,
    @CurrentUser()
    user: AuthUser,
  ) {
    if (
      !user.regionalAssociationId
    ) {
      throw new ForbiddenException(
        'Aucune association n’est rattachée à ce compte.',
      );
    }

    return this.service
      .uploadPublicNewsMedia(
        file,
        user,
        `associations/${user.regionalAssociationId}/news`,
      );
  }  
}