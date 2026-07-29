import {
  Controller,
  ForbiddenException,
  Post,
  UploadedFile,
  UseInterceptors,
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

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

import {
  MediaService,
} from './media.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly service: MediaService,
  ) {}

  /*
   * Images génériques de l’administration.
   */

  @Post('admin/images')
  @Permissions('associations.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage:
        memoryStorage(),

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
    return this.service.uploadPublicImage(
      file,
      user,
    );
  }

  /*
   * Images génériques d’une association.
   */

  @Post('association/images')
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
    if (
      !user.regionalAssociationId
    ) {
      throw new ForbiddenException(
        'Aucune association n’est rattachée à ce compte.',
      );
    }

    return this.service.uploadPublicImage(
      file,
      user,
      `associations/${user.regionalAssociationId}`,
    );
  }

  /*
   * Images du hero de la page d’accueil.
   */

  @Post('admin/homepage-images')
  @Permissions('homepage.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage:
        memoryStorage(),

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

  /*
   * Médias des actualités FLASCAM.
   */

  @Post('admin/news-media')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('news.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage:
        memoryStorage(),

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

  /*
   * Médias des actualités d’association.
   */

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
          100 * 1024 * 1024,
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

    return this.service.uploadPublicNewsMedia(
      file,
      user,
      `associations/${user.regionalAssociationId}/news`,
    );
  }

  /*
   * Vidéo autonome ajoutée par la FLASCAM.
   */

  @Post('admin/videos')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('videos.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage:
        memoryStorage(),

      /*
       * Cette limite Multer est volontairement légèrement
       * supérieure à la limite métier par défaut.
       *
       * La vraie limite configurable est ensuite vérifiée
       * dans MediaService avec UPLOAD_MAX_VIDEO_SIZE_MB.
       */
      limits: {
        fileSize:
          500 * 1024 * 1024,
      },
    }),
  )
  uploadAdminVideo(
    @UploadedFile()
    file: Express.Multer.File,

    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service.uploadVideo(
      file,
      user,
      {
        folder:
          'videos/flascam',

        associationId:
          null,
      },
    );
  }

  /*
   * Miniature d’une vidéo FLASCAM.
   */

  @Post('admin/video-thumbnails')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions('videos.manage')
  @UseInterceptors(
    FileInterceptor('file', {
      storage:
        memoryStorage(),

      limits: {
        fileSize:
          10 * 1024 * 1024,
      },
    }),
  )
  uploadAdminVideoThumbnail(
    @UploadedFile()
    file: Express.Multer.File,

    @CurrentUser()
    user: AuthUser,
  ) {
    return this.service.uploadVideoThumbnail(
      file,
      user,
      {
        folder:
          'videos/flascam/thumbnails',

        associationId:
          null,
      },
    );
  }

  /*
   * Vidéo autonome ajoutée par une association.
   *
   * L’import du fichier ne publie pas la vidéo.
   * Le fichier sera ensuite rattaché à un enregistrement
   * videos créé avec le statut DRAFT.
   */

  @Post('association/videos')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage:
        memoryStorage(),

      limits: {
        fileSize:
          500 * 1024 * 1024,
      },
    }),
  )
  uploadAssociationVideo(
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

    return this.service.uploadVideo(
      file,
      user,
      {
        folder:
          `associations/${user.regionalAssociationId}/videos`,

        associationId:
          user.regionalAssociationId,
      },
    );
  }

  /*
   * Miniature d’une vidéo d’association.
   */

  @Post('association/video-thumbnails')
  @Roles('ASSOCIATION_ADMIN')
  @Permissions(
    'association.videos.manage',
  )
  @UseInterceptors(
    FileInterceptor('file', {
      storage:
        memoryStorage(),

      limits: {
        fileSize:
          10 * 1024 * 1024,
      },
    }),
  )
  uploadAssociationVideoThumbnail(
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

    return this.service.uploadVideoThumbnail(
      file,
      user,
      {
        folder:
          `associations/${user.regionalAssociationId}/videos/thumbnails`,

        associationId:
          user.regionalAssociationId,
      },
    );
  }
}