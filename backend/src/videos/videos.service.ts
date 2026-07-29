import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  Cron,
  CronExpression,
} from '@nestjs/schedule';

import type {
  Request,
} from 'express';

import {
  Prisma,
} from '../generated/prisma/client';

import {
  AuditLogsService,
} from '../audit-logs/audit-logs.service';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

import {
  PrismaService,
} from '../prisma/prisma.service';

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

@Injectable()
export class VideosService {
  private readonly logger =
    new Logger(
      VideosService.name,
    );

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    private readonly config: ConfigService,
  ) {}

  /*
   * Routes publiques
   */

  async getPublicVideos(
    query: PublicVideosQueryDto,
  ) {
    const page =
      query.page;

    const limit =
      query.limit;

    const skip =
      (page - 1) *
      limit;

    const where =
      await this.buildPublicWhere(
        query,
      );

    const [
      videos,
      total,
    ] =
      await Promise.all([
        this.prisma.videos.findMany({
          where,

          orderBy: [
            {
              display_order:
                'asc',
            },
            {
              published_at:
                'desc',
            },
            {
              created_at:
                'desc',
            },
          ],

          skip,
          take:
            limit,
        }),

        this.prisma.videos.count({
          where,
        }),
      ]);

    return {
      items:
        await this.formatVideos(
          videos,
        ),

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total /
              limit,
          ),
      },
    };
  }

  async getFeaturedVideos() {
    const videos =
      await this.prisma.videos.findMany({
        where: {
          status:
            'PUBLISHED',

          is_featured:
            true,

          published_at: {
            not:
              null,

            lte:
              new Date(),
          },

          deleted_at:
            null,
        },

        orderBy: [
          {
            display_order:
              'asc',
          },
          {
            published_at:
              'desc',
          },
        ],

        take:
          8,
      });

    return this.formatVideos(
      videos,
    );
  }

  async getAssociationPublicVideos(
    associationSlug: string,
    query: PublicVideosQueryDto,
  ) {
    const association =
      await this.prisma.regional_associations.findFirst({
        where: {
          slug:
            associationSlug,

          deleted_at:
            null,

          status:
            'PUBLISHED',
        },

        select: {
          id:
            true,
        },
      });

    if (
      !association
    ) {
      throw new NotFoundException(
        'Association introuvable.',
      );
    }

    return this.getPublicVideos({
      ...query,

      associationSlug,
    });
  }

  async getPublicVideoBySlug(
    slug: string,
  ) {
    const video =
      await this.prisma.videos.findFirst({
        where: {
          slug,

          status:
            'PUBLISHED',

          published_at: {
            not:
              null,

            lte:
              new Date(),
          },

          deleted_at:
            null,
        },
      });

    if (
      !video
    ) {
      throw new NotFoundException(
        'Vidéo introuvable.',
      );
    }

    return this.formatVideo(
      video,
    );
  }

  /*
   * Administration FLASCAM
   */

  async getAdminVideos(
    query: AdminVideosQueryDto,
  ) {
    const page =
      query.page;

    const limit =
      query.limit;

    const skip =
      (page - 1) *
      limit;

    const where:
      Prisma.videosWhereInput = {
      deleted_at:
        null,

      ...(query.status
        ? {
            status:
              query.status,
          }
        : {}),

      ...(query.provider
        ? {
            provider:
              query.provider,
          }
        : {}),

      ...(query.sourceType
        ? {
            source_type:
              query.sourceType,
          }
        : {}),

      ...(query.regionalAssociationId
        ? {
            regional_association_id:
              query.regionalAssociationId,
          }
        : {}),

      ...(query.search?.trim()
        ? {
            OR: [
              {
                title: {
                  contains:
                    query.search.trim(),

                  mode:
                    'insensitive',
                },
              },
              {
                excerpt: {
                  contains:
                    query.search.trim(),

                  mode:
                    'insensitive',
                },
              },
              {
                description: {
                  contains:
                    query.search.trim(),

                  mode:
                    'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [
      videos,
      total,
    ] =
      await Promise.all([
        this.prisma.videos.findMany({
          where,

          orderBy: [
            {
              updated_at:
                'desc',
            },
          ],

          skip,
          take:
            limit,
        }),

        this.prisma.videos.count({
          where,
        }),
      ]);

    return {
      items:
        await this.formatVideos(
          videos,
        ),

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total /
              limit,
          ),
      },
    };
  }

  async getAdminVideoById(
    id: string,
  ) {
    const video =
      await this.prisma.videos.findFirst({
        where: {
          id,

          deleted_at:
            null,
        },
      });

    if (
      !video
    ) {
      throw new NotFoundException(
        'Vidéo introuvable.',
      );
    }

    return this.formatVideo(
      video,
    );
  }

  async createAdminVideo(
    dto: UpsertVideoDto,
    user: AuthUser,
    request: Request,
  ) {
    await this.validatePayload(
      dto,
    );

    await this.validateAssociation(
      dto.regionalAssociationId,
    );

    const youtubeId =
      dto.provider ===
      'YOUTUBE'
        ? this.extractYoutubeVideoId(
            dto.externalUrl,
          )
        : null;

    const scheduledAt =
      this.parseScheduledAt(
        dto.scheduledAt,
      );

    const video =
      await this.prisma.videos.create({
        data: {
          regional_association_id:
            dto.regionalAssociationId ??
            null,

          created_by_user_id:
            user.id,

          updated_by_user_id:
            user.id,

          source_type:
            'STANDALONE',

          provider:
            dto.provider,

          status:
            'DRAFT',

          title:
            dto.title.trim(),

          slug:
            dto.slug.trim(),

          excerpt:
            dto.excerpt?.trim() ||
            null,

          description:
            dto.description?.trim() ||
            null,

          external_url:
            dto.provider ===
            'YOUTUBE'
              ? dto.externalUrl?.trim()
              : null,

          external_video_id:
            youtubeId,

          media_asset_id:
            dto.provider ===
            'UPLOADED'
              ? dto.mediaAssetId
              : null,

          thumbnail_media_asset_id:
            dto.thumbnailMediaAssetId ??
            null,

          seo_title:
            dto.seoTitle?.trim() ||
            null,

          seo_description:
            dto.seoDescription?.trim() ||
            null,

          display_order:
            dto.displayOrder ??
            0,

          is_featured:
            dto.isFeatured ??
            false,

          scheduled_at:
            scheduledAt,

          created_at:
            new Date(),

          updated_at:
            new Date(),
        },
      });

    await this.writeAudit(
      request,
      user,
      'VIDEO_CREATED',
      video.id,
      `Vidéo créée : ${video.title}.`,
      {
        provider:
          video.provider,

        associationId:
          video.regional_association_id,
      },
    );

    return this.getAdminVideoById(
      video.id,
    );
  }

  async updateAdminVideo(
    id: string,
    dto: UpsertVideoDto,
    user: AuthUser,
    request: Request,
  ) {
    const existing =
      await this.findExistingVideo(
        id,
      );

    await this.validatePayload(
      dto,
      id,
    );

    await this.validateAssociation(
      dto.regionalAssociationId,
    );

    const youtubeId =
      dto.provider ===
      'YOUTUBE'
        ? this.extractYoutubeVideoId(
            dto.externalUrl,
          )
        : null;

    const scheduledAt =
      this.parseScheduledAt(
        dto.scheduledAt,
      );

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          regional_association_id:
            dto.regionalAssociationId ??
            null,

          provider:
            dto.provider,

          title:
            dto.title.trim(),

          slug:
            dto.slug.trim(),

          excerpt:
            dto.excerpt?.trim() ||
            null,

          description:
            dto.description?.trim() ||
            null,

          external_url:
            dto.provider ===
            'YOUTUBE'
              ? dto.externalUrl?.trim()
              : null,

          external_video_id:
            youtubeId,

          media_asset_id:
            dto.provider ===
            'UPLOADED'
              ? dto.mediaAssetId
              : null,

          thumbnail_media_asset_id:
            dto.thumbnailMediaAssetId ??
            null,

          seo_title:
            dto.seoTitle?.trim() ||
            null,

          seo_description:
            dto.seoDescription?.trim() ||
            null,

          display_order:
            dto.displayOrder ??
            0,

          is_featured:
            dto.isFeatured ??
            false,

          scheduled_at:
            existing.status ===
            'DRAFT'
              ? scheduledAt
              : null,

          updated_by_user_id:
            user.id,

          updated_at:
            new Date(),
        },
      });

    await this.writeAudit(
      request,
      user,
      'VIDEO_UPDATED',
      video.id,
      `Vidéo modifiée : ${video.title}.`,
      {
        previousProvider:
          existing.provider,

        newProvider:
          video.provider,
      },
    );

    return this.getAdminVideoById(
      video.id,
    );
  }

  async updateAdminVideoStatus(
    id: string,
    dto: UpdateVideoStatusDto,
    user: AuthUser,
    request: Request,
  ) {
    const existing =
      await this.findExistingVideo(
        id,
      );

    if (
      dto.status ===
      'PUBLISHED'
    ) {
      await this.ensureVideoCanBePublished(
        existing,
      );
    }

    const now =
      new Date();

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          status:
            dto.status,

          published_at:
            dto.status ===
            'PUBLISHED'
              ? now
              : null,

          scheduled_at:
            null,

          rejection_reason:
            null,

          updated_by_user_id:
            user.id,

          updated_at:
            now,
        },
      });

    await this.writeAudit(
      request,
      user,
      'VIDEO_STATUS_UPDATED',
      video.id,
      `Statut de la vidéo modifié : ${dto.status}.`,
      {
        previousStatus:
          existing.status,

        newStatus:
          dto.status,
      },
    );

    return this.getAdminVideoById(
      video.id,
    );
  }

  async approveAssociationVideo(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const existing =
      await this.findExistingVideo(
        id,
      );

    if (
      !existing.regional_association_id
    ) {
      throw new BadRequestException(
        'Cette vidéo n’appartient pas à une association.',
      );
    }

    if (
      existing.status !==
      'PENDING_REVIEW'
    ) {
      throw new BadRequestException(
        'Seule une vidéo en attente de validation peut être approuvée.',
      );
    }

    await this.ensureVideoCanBePublished(
      existing,
    );

    const now =
      new Date();

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          status:
            'PUBLISHED',

          published_at:
            now,

          scheduled_at:
            null,

          reviewed_at:
            now,

          reviewed_by_user_id:
            user.id,

          rejection_reason:
            null,

          updated_by_user_id:
            user.id,

          updated_at:
            now,
        },
      });

    await this.writeAudit(
      request,
      user,
      'ASSOCIATION_VIDEO_APPROVED',
      video.id,
      `Vidéo d’association approuvée : ${video.title}.`,
      {
        associationId:
          video.regional_association_id,
      },
    );

    return this.getAdminVideoById(
      video.id,
    );
  }

  async rejectAssociationVideo(
    id: string,
    dto: RejectVideoDto,
    user: AuthUser,
    request: Request,
  ) {
    const existing =
      await this.findExistingVideo(
        id,
      );

    if (
      !existing.regional_association_id
    ) {
      throw new BadRequestException(
        'Cette vidéo n’appartient pas à une association.',
      );
    }

    if (
      existing.status !==
      'PENDING_REVIEW'
    ) {
      throw new BadRequestException(
        'Seule une vidéo en attente de validation peut être rejetée.',
      );
    }

    const now =
      new Date();

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          status:
            'REJECTED',

          published_at:
            null,

          scheduled_at:
            null,

          reviewed_at:
            now,

          reviewed_by_user_id:
            user.id,

          rejection_reason:
            dto.reason.trim(),

          updated_by_user_id:
            user.id,

          updated_at:
            now,
        },
      });

    await this.writeAudit(
      request,
      user,
      'ASSOCIATION_VIDEO_REJECTED',
      video.id,
      `Vidéo d’association rejetée : ${video.title}.`,
      {
        associationId:
          video.regional_association_id,

        reason:
          dto.reason.trim(),
      },
    );

    return this.getAdminVideoById(
      video.id,
    );
  }

  async scheduleVideo(
    id: string,
    dto: ScheduleVideoDto,
    user: AuthUser,
    request: Request,
  ) {
    const existing =
      await this.findExistingVideo(
        id,
      );

    if (
      existing.source_type !==
      'STANDALONE'
    ) {
      throw new BadRequestException(
        'Une vidéo provenant d’une actualité ne peut pas être programmée indépendamment.',
      );
    }

    if (
      existing.regional_association_id
    ) {
      throw new BadRequestException(
        'Une vidéo d’association doit être soumise puis validée. Elle ne peut pas être programmée directement.',
      );
    }

    if (
      existing.status !==
      'DRAFT'
    ) {
      throw new BadRequestException(
        'Seule une vidéo en brouillon peut être programmée.',
      );
    }

    await this.ensureVideoCanBePublished(
      existing,
    );

    const scheduledAt =
      this.parseRequiredFutureDate(
        dto.scheduledAt,
      );

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          scheduled_at:
            scheduledAt,

          updated_by_user_id:
            user.id,

          updated_at:
            new Date(),
        },
      });

    await this.writeAudit(
      request,
      user,
      'VIDEO_PUBLICATION_SCHEDULED',
      video.id,
      `Publication de la vidéo programmée : ${video.title}.`,
      {
        scheduledAt:
          scheduledAt.toISOString(),
      },
    );

    return this.getAdminVideoById(
      video.id,
    );
  }

  async cancelVideoSchedule(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const existing =
      await this.findExistingVideo(
        id,
      );

    if (
      !existing.scheduled_at
    ) {
      throw new BadRequestException(
        'Cette vidéo ne possède aucune programmation.',
      );
    }

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          scheduled_at:
            null,

          updated_by_user_id:
            user.id,

          updated_at:
            new Date(),
        },
      });

    await this.writeAudit(
      request,
      user,
      'VIDEO_PUBLICATION_SCHEDULE_CANCELLED',
      video.id,
      `Programmation annulée : ${video.title}.`,
      {
        previousScheduledAt:
          existing.scheduled_at.toISOString(),
      },
    );

    return this.getAdminVideoById(
      video.id,
    );
  }

  async deleteAdminVideo(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const existing =
      await this.findExistingVideo(
        id,
      );

    const now =
      new Date();

    await this.prisma.videos.update({
      where: {
        id,
      },

      data: {
        deleted_at:
          now,

        status:
          'ARCHIVED',

        published_at:
          null,

        scheduled_at:
          null,

        updated_by_user_id:
          user.id,

        updated_at:
          now,
      },
    });

    await this.writeAudit(
      request,
      user,
      'VIDEO_DELETED',
      existing.id,
      `Vidéo supprimée : ${existing.title}.`,
      {
        sourceType:
          existing.source_type,
      },
    );

    return {
      success:
        true,
    };
  }

  /*
   * Espace association
   */

  async getAssociationVideos(
    query: AssociationVideosQueryDto,
    user: AuthUser,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const page =
      query.page;

    const limit =
      query.limit;

    const skip =
      (page - 1) *
      limit;

    const where:
      Prisma.videosWhereInput = {
      regional_association_id:
        associationId,

      deleted_at:
        null,

      ...(query.status
        ? {
            status:
              query.status,
          }
        : {}),

      ...(query.provider
        ? {
            provider:
              query.provider,
          }
        : {}),

      ...(query.search?.trim()
        ? {
            OR: [
              {
                title: {
                  contains:
                    query.search.trim(),

                  mode:
                    'insensitive',
                },
              },
              {
                excerpt: {
                  contains:
                    query.search.trim(),

                  mode:
                    'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [
      videos,
      total,
    ] =
      await Promise.all([
        this.prisma.videos.findMany({
          where,

          orderBy: {
            updated_at:
              'desc',
          },

          skip,
          take:
            limit,
        }),

        this.prisma.videos.count({
          where,
        }),
      ]);

    return {
      items:
        await this.formatVideos(
          videos,
        ),

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(
            total /
              limit,
          ),
      },
    };
  }

  async getAssociationVideoById(
    id: string,
    user: AuthUser,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const video =
      await this.prisma.videos.findFirst({
        where: {
          id,

          regional_association_id:
            associationId,

          deleted_at:
            null,
        },
      });

    if (
      !video
    ) {
      throw new NotFoundException(
        'Vidéo introuvable.',
      );
    }

    return this.formatVideo(
      video,
    );
  }

  async createAssociationVideo(
    dto: UpsertVideoDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    await this.validatePayload(
      dto,
    );

if (
  dto.provider ===
    'UPLOADED' &&
  dto.mediaAssetId
) {
  await this.validateAssociationMediaOwnership(
    dto.mediaAssetId,
    associationId,
    'VIDEO',
  );
}

if (
  dto.thumbnailMediaAssetId
) {
  await this.validateAssociationMediaOwnership(
    dto.thumbnailMediaAssetId,
    associationId,
    'THUMBNAIL',
  );
}    

    const youtubeId =
      dto.provider ===
      'YOUTUBE'
        ? this.extractYoutubeVideoId(
            dto.externalUrl,
          )
        : null;

    const video =
      await this.prisma.videos.create({
        data: {
          regional_association_id:
            associationId,

          created_by_user_id:
            user.id,

          updated_by_user_id:
            user.id,

          source_type:
            'STANDALONE',

          provider:
            dto.provider,

          status:
            'DRAFT',

          title:
            dto.title.trim(),

          slug:
            dto.slug.trim(),

          excerpt:
            dto.excerpt?.trim() ||
            null,

          description:
            dto.description?.trim() ||
            null,

          external_url:
            dto.provider ===
            'YOUTUBE'
              ? dto.externalUrl?.trim()
              : null,

          external_video_id:
            youtubeId,

          media_asset_id:
            dto.provider ===
            'UPLOADED'
              ? dto.mediaAssetId
              : null,

          thumbnail_media_asset_id:
            dto.thumbnailMediaAssetId ??
            null,

          seo_title:
            dto.seoTitle?.trim() ||
            null,

          seo_description:
            dto.seoDescription?.trim() ||
            null,

          display_order:
            0,

          is_featured:
            false,

          scheduled_at:
            null,

          created_at:
            new Date(),

          updated_at:
            new Date(),
        },
      });

    await this.writeAudit(
      request,
      user,
      'ASSOCIATION_VIDEO_CREATED',
      video.id,
      `Vidéo d’association créée : ${video.title}.`,
      {
        associationId,
      },
    );

    return this.getAssociationVideoById(
      video.id,
      user,
    );
  }

  async updateAssociationVideo(
    id: string,
    dto: UpsertVideoDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const existing =
      await this.findAssociationVideo(
        id,
        associationId,
      );

    if (
      ![
        'DRAFT',
        'REJECTED',
      ].includes(
        existing.status,
      )
    ) {
      throw new ForbiddenException(
        'Une vidéo en attente de validation ou déjà publiée ne peut pas être modifiée.',
      );
    }

    if (
      existing.source_type !==
      'STANDALONE'
    ) {
      throw new ForbiddenException(
        'Une vidéo provenant d’une actualité doit être modifiée depuis l’actualité concernée.',
      );
    }

    await this.validatePayload(
      dto,
      id,
    );

if (
  dto.provider ===
    'UPLOADED' &&
  dto.mediaAssetId
) {
  await this.validateAssociationMediaOwnership(
    dto.mediaAssetId,
    associationId,
    'VIDEO',
  );
}

if (
  dto.thumbnailMediaAssetId
) {
  await this.validateAssociationMediaOwnership(
    dto.thumbnailMediaAssetId,
    associationId,
    'THUMBNAIL',
  );
}

    const youtubeId =
      dto.provider ===
      'YOUTUBE'
        ? this.extractYoutubeVideoId(
            dto.externalUrl,
          )
        : null;

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          provider:
            dto.provider,

          status:
            'DRAFT',

          title:
            dto.title.trim(),

          slug:
            dto.slug.trim(),

          excerpt:
            dto.excerpt?.trim() ||
            null,

          description:
            dto.description?.trim() ||
            null,

          external_url:
            dto.provider ===
            'YOUTUBE'
              ? dto.externalUrl?.trim()
              : null,

          external_video_id:
            youtubeId,

          media_asset_id:
            dto.provider ===
            'UPLOADED'
              ? dto.mediaAssetId
              : null,

          thumbnail_media_asset_id:
            dto.thumbnailMediaAssetId ??
            null,

          seo_title:
            dto.seoTitle?.trim() ||
            null,

          seo_description:
            dto.seoDescription?.trim() ||
            null,

          rejection_reason:
            null,

          reviewed_at:
            null,

          reviewed_by_user_id:
            null,

          updated_by_user_id:
            user.id,

          updated_at:
            new Date(),
        },
      });

    await this.writeAudit(
      request,
      user,
      'ASSOCIATION_VIDEO_UPDATED',
      video.id,
      `Vidéo d’association modifiée : ${video.title}.`,
      {
        associationId,
      },
    );

    return this.getAssociationVideoById(
      video.id,
      user,
    );
  }

  async submitAssociationVideo(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const existing =
      await this.findAssociationVideo(
        id,
        associationId,
      );

    if (
      ![
        'DRAFT',
        'REJECTED',
      ].includes(
        existing.status,
      )
    ) {
      throw new BadRequestException(
        'Seule une vidéo en brouillon ou rejetée peut être soumise.',
      );
    }

    await this.ensureVideoCanBePublished(
      existing,
    );

    const now =
      new Date();

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          status:
            'PENDING_REVIEW',

          submitted_at:
            now,

          published_at:
            null,

          scheduled_at:
            null,

          reviewed_at:
            null,

          reviewed_by_user_id:
            null,

          rejection_reason:
            null,

          updated_by_user_id:
            user.id,

          updated_at:
            now,
        },
      });

    await this.writeAudit(
      request,
      user,
      'ASSOCIATION_VIDEO_SUBMITTED',
      video.id,
      `Vidéo soumise à validation : ${video.title}.`,
      {
        associationId,
      },
    );

    return this.getAssociationVideoById(
      video.id,
      user,
    );
  }

  async unpublishAssociationVideo(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const existing =
      await this.findAssociationVideo(
        id,
        associationId,
      );

    if (
      existing.status !==
      'PUBLISHED'
    ) {
      throw new BadRequestException(
        'Seule une vidéo publiée peut être dépubliée.',
      );
    }

    if (
      existing.source_type !==
      'STANDALONE'
    ) {
      throw new ForbiddenException(
        'Cette vidéo dépend d’une actualité. Dépubliez l’actualité pour la retirer du site.',
      );
    }

    const video =
      await this.prisma.videos.update({
        where: {
          id,
        },

        data: {
          status:
            'DRAFT',

          published_at:
            null,

          updated_by_user_id:
            user.id,

          updated_at:
            new Date(),
        },
      });

    await this.writeAudit(
      request,
      user,
      'ASSOCIATION_VIDEO_UNPUBLISHED',
      video.id,
      `Vidéo dépubliée : ${video.title}.`,
      {
        associationId,
      },
    );

    return this.getAssociationVideoById(
      video.id,
      user,
    );
  }

  async deleteAssociationVideo(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const existing =
      await this.findAssociationVideo(
        id,
        associationId,
      );

    if (
      existing.source_type !==
      'STANDALONE'
    ) {
      throw new ForbiddenException(
        'Cette vidéo dépend d’une actualité et doit être supprimée depuis cette actualité.',
      );
    }

    if (
      existing.status ===
      'PENDING_REVIEW'
    ) {
      throw new ForbiddenException(
        'Une vidéo en cours de validation ne peut pas être supprimée.',
      );
    }

    const now =
      new Date();

    await this.prisma.videos.update({
      where: {
        id,
      },

      data: {
        deleted_at:
          now,

        status:
          'ARCHIVED',

        published_at:
          null,

        scheduled_at:
          null,

        updated_by_user_id:
          user.id,

        updated_at:
          now,
      },
    });

    await this.writeAudit(
      request,
      user,
      'ASSOCIATION_VIDEO_DELETED',
      existing.id,
      `Vidéo supprimée : ${existing.title}.`,
      {
        associationId,
      },
    );

    return {
      success:
        true,
    };
  }

  /*
   * Publication automatique
   */

  @Cron(
    CronExpression.EVERY_MINUTE,
  )
  async publishScheduledVideos() {
    const now =
      new Date();

    const scheduledVideos =
      await this.prisma.videos.findMany({
        where: {
          source_type:
            'STANDALONE',

          status:
            'DRAFT',

          regional_association_id:
            null,

          scheduled_at: {
            not:
              null,

            lte:
              now,
          },

          deleted_at:
            null,
        },

        take:
          100,
      });

    for (
      const video
      of scheduledVideos
    ) {
      try {
        await this.ensureVideoCanBePublished(
          video,
        );

        await this.prisma.videos.update({
          where: {
            id:
              video.id,
          },

          data: {
            status:
              'PUBLISHED',

            published_at:
              now,

            scheduled_at:
              null,

            updated_at:
              now,
          },
        });

        this.logger.log(
          `Vidéo programmée publiée : ${video.id}`,
        );
      } catch (
        error
      ) {
        this.logger.error(
          `Échec de publication de la vidéo ${video.id}.`,

          error instanceof Error
            ? error.stack
            : undefined,
        );
      }
    }
  }

  /*
   * Validations
   */

  private async validatePayload(
    dto: UpsertVideoDto,
    excludedId?: string,
  ) {
    const title =
      dto.title.trim();

    const slug =
      dto.slug.trim();

    if (
      title.length <
      3
    ) {
      throw new BadRequestException(
        'Le titre doit contenir au moins 3 caractères.',
      );
    }

    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        slug,
      )
    ) {
      throw new BadRequestException(
        'Le slug doit contenir uniquement des lettres minuscules, des chiffres et des tirets.',
      );
    }

    const duplicate =
      await this.prisma.videos.findFirst({
        where: {
          slug,

          deleted_at:
            null,

          ...(excludedId
            ? {
                id: {
                  not:
                    excludedId,
                },
              }
            : {}),
        },

        select: {
          id:
            true,
        },
      });

    if (
      duplicate
    ) {
      throw new ConflictException(
        'Une autre vidéo utilise déjà ce slug.',
      );
    }

    if (
      dto.provider ===
      'YOUTUBE'
    ) {
      this.extractYoutubeVideoId(
        dto.externalUrl,
      );
    }

    if (
      dto.provider ===
      'UPLOADED'
    ) {
      if (
        !dto.mediaAssetId
      ) {
        throw new BadRequestException(
          'Le fichier vidéo est obligatoire.',
        );
      }

      await this.validateVideoMediaAsset(
        dto.mediaAssetId,
      );
    }

    if (
      dto.thumbnailMediaAssetId
    ) {
      await this.validateImageMediaAsset(
        dto.thumbnailMediaAssetId,
      );
    }
  }

  private async validateVideoMediaAsset(
    mediaAssetId: string,
  ) {
    const media =
      await this.prisma.media_assets.findFirst({
        where: {
          id:
            mediaAssetId,

          deleted_at:
            null,
        },
      });

    if (
      !media
    ) {
      throw new BadRequestException(
        'Le fichier vidéo sélectionné est introuvable.',
      );
    }

    const mimeType =
      media.mime_type.toLowerCase();

    if (
      media.media_type !==
        'VIDEO' ||
      ![
        'video/mp4',
        'video/webm',
        'video/quicktime',
      ].includes(
        mimeType,
      )
    ) {
      throw new BadRequestException(
        'Le média sélectionné n’est pas une vidéo MP4, WEBM ou MOV valide.',
      );
    }
  }

  private async validateImageMediaAsset(
    mediaAssetId: string,
  ) {
    const media =
      await this.prisma.media_assets.findFirst({
        where: {
          id:
            mediaAssetId,

          deleted_at:
            null,
        },
      });

    if (
      !media
    ) {
      throw new BadRequestException(
        'La miniature sélectionnée est introuvable.',
      );
    }

    if (
      media.media_type !==
      'IMAGE'
    ) {
      throw new BadRequestException(
        'La miniature doit être une image.',
      );
    }
  }

private async validateAssociationMediaOwnership(
  mediaAssetId: string,
  associationId: string,
  expectedPurpose:
    | 'VIDEO'
    | 'THUMBNAIL',
) {
  const media =
    await this.prisma.media_assets.findFirst({
      where: {
        id:
          mediaAssetId,

        deleted_at:
          null,
      },

      select: {
        id:
          true,

        uploaded_by_user_id:
          true,

        media_type:
          true,

        metadata:
          true,
      },
    });

  if (
    !media
  ) {
    throw new BadRequestException(
      'Le média sélectionné est introuvable.',
    );
  }

  const metadata =
    media.metadata &&
    typeof media.metadata ===
      'object' &&
    !Array.isArray(
      media.metadata,
    )
      ? media.metadata as Prisma.JsonObject
      : null;

  const mediaAssociationId =
    typeof metadata?.regionalAssociationId ===
    'string'
      ? metadata.regionalAssociationId
      : null;

  const module =
    typeof metadata?.module ===
    'string'
      ? metadata.module
      : null;

  const uploadPurpose =
    typeof metadata?.uploadPurpose ===
    'string'
      ? metadata.uploadPurpose
      : null;

  if (
    module !==
      'VIDEOS' ||
    uploadPurpose !==
      expectedPurpose ||
    mediaAssociationId !==
      associationId
  ) {
    throw new ForbiddenException(
      'Ce média n’appartient pas à votre association.',
    );
  }
}  

  private async validateAssociation(
    associationId?: string,
  ) {
    if (
      !associationId
    ) {
      return;
    }

    const association =
      await this.prisma.regional_associations.findFirst({
        where: {
          id:
            associationId,

          deleted_at:
            null,
        },

        select: {
          id:
            true,
        },
      });

    if (
      !association
    ) {
      throw new BadRequestException(
        'L’association sélectionnée est introuvable.',
      );
    }
  }

  private async ensureVideoCanBePublished(
    video: {
      provider: string;
      media_asset_id: string | null;
      external_url: string | null;
      external_video_id: string | null;
      title: string;
      slug: string;
    },
  ) {
    if (
      !video.title.trim() ||
      !video.slug.trim()
    ) {
      throw new BadRequestException(
        'Le titre et le slug sont obligatoires avant publication.',
      );
    }

    if (
      video.provider ===
      'YOUTUBE'
    ) {
      this.extractYoutubeVideoId(
        video.external_url ??
          undefined,
      );
    }

    if (
      video.provider ===
      'UPLOADED'
    ) {
      if (
        !video.media_asset_id
      ) {
        throw new BadRequestException(
          'La vidéo importée est absente.',
        );
      }

      await this.validateVideoMediaAsset(
        video.media_asset_id,
      );
    }
  }

  /*
   * Formatage
   */

  private async formatVideos(
    videos: Array<{
      id: string;
      regional_association_id: string | null;
      news_article_id: string | null;
      media_asset_id: string | null;
      thumbnail_media_asset_id: string | null;
      source_type: string;
      provider: string;
      status: string;
      title: string;
      slug: string;
      excerpt: string | null;
      description: string | null;
      external_url: string | null;
      external_video_id: string | null;
      duration_seconds: Prisma.Decimal | null;
      seo_title: string | null;
      seo_description: string | null;
      display_order: number;
      is_featured: boolean;
      published_at: Date | null;
      scheduled_at: Date | null;
      submitted_at: Date | null;
      reviewed_at: Date | null;
      rejection_reason: string | null;
      created_at: Date;
      updated_at: Date;
    }>,
  ) {
    return Promise.all(
      videos.map(
        (video) =>
          this.formatVideo(
            video,
          ),
      ),
    );
  }

  private async formatVideo(
    video: {
      id: string;
      regional_association_id: string | null;
      news_article_id: string | null;
      media_asset_id: string | null;
      thumbnail_media_asset_id: string | null;
      source_type: string;
      provider: string;
      status: string;
      title: string;
      slug: string;
      excerpt: string | null;
      description: string | null;
      external_url: string | null;
      external_video_id: string | null;
      duration_seconds: Prisma.Decimal | null;
      seo_title: string | null;
      seo_description: string | null;
      display_order: number;
      is_featured: boolean;
      published_at: Date | null;
      scheduled_at: Date | null;
      submitted_at: Date | null;
      reviewed_at: Date | null;
      rejection_reason: string | null;
      created_at: Date;
      updated_at: Date;
    },
  ) {
    const [
      association,
      media,
      thumbnail,
    ] =
      await Promise.all([
        video.regional_association_id
          ? this.prisma.regional_associations.findFirst({
              where: {
                id:
                  video.regional_association_id,
              },

              select: {
                id:
                  true,

                name:
                  true,

                acronym:
                  true,

                slug:
                  true,
              },
            })
          : null,

        video.media_asset_id
          ? this.prisma.media_assets.findFirst({
              where: {
                id:
                  video.media_asset_id,

                deleted_at:
                  null,
              },
            })
          : null,

        video.thumbnail_media_asset_id
          ? this.prisma.media_assets.findFirst({
              where: {
                id:
                  video.thumbnail_media_asset_id,

                deleted_at:
                  null,
              },
            })
          : null,
      ]);

    return {
      id:
        video.id,

      title:
        video.title,

      slug:
        video.slug,

      excerpt:
        video.excerpt,

      description:
        video.description,

      sourceType:
        video.source_type,

      provider:
        video.provider,

      status:
        video.status,

      externalUrl:
        video.external_url,

      externalVideoId:
        video.external_video_id,

      youtubeEmbedUrl:
        video.provider ===
          'YOUTUBE' &&
        video.external_video_id
          ? `https://www.youtube-nocookie.com/embed/${video.external_video_id}`
          : null,

      media:
        media
          ? this.formatMedia(
              media,
            )
          : null,

      thumbnail:
        thumbnail
          ? this.formatMedia(
              thumbnail,
            )
          : video.provider ===
              'YOUTUBE' &&
            video.external_video_id
          ? {
              id:
                null,

              url:
                `https://i.ytimg.com/vi/${video.external_video_id}/hqdefault.jpg`,

              altText:
                video.title,

              width:
                null,

              height:
                null,
            }
          : null,

      association:
        association
          ? {
              id:
                association.id,

              name:
                association.name,

              acronym:
                association.acronym,

              slug:
                association.slug,
            }
          : null,

      newsArticleId:
        video.news_article_id,

      durationSeconds:
        video.duration_seconds
          ? Number(
              video.duration_seconds,
            )
          : media?.duration_seconds
          ? Number(
              media.duration_seconds,
            )
          : null,

      seo: {
        title:
          video.seo_title,

        description:
          video.seo_description,
      },

      displayOrder:
        video.display_order,

      isFeatured:
        video.is_featured,

      publishedAt:
        video.published_at,

      scheduledAt:
        video.scheduled_at,

      submittedAt:
        video.submitted_at,

      reviewedAt:
        video.reviewed_at,

      rejectionReason:
        video.rejection_reason,

      createdAt:
        video.created_at,

      updatedAt:
        video.updated_at,
    };
  }

private formatMedia(
  media: {
    id: string;
    bucket_name: string;
    media_type: string;
    mime_type: string;
    object_key: string;
    original_filename: string;
    alt_text: string | null;
    width: number | null;
    height: number | null;
    duration_seconds: Prisma.Decimal | null;
    size_bytes: bigint;
  },
) {
  return {
    id:
      media.id,

    mediaType:
      media.media_type,

    mimeType:
      media.mime_type,

    originalFilename:
      media.original_filename,

    objectKey:
      media.object_key,

    url:
      this.buildMediaUrl(
        media.object_key,
        media.bucket_name,
      ),

    altText:
      media.alt_text,

    width:
      media.width,

    height:
      media.height,

    durationSeconds:
      media.duration_seconds !== null
        ? Number(
            media.duration_seconds,
          )
        : null,

    sizeBytes:
      Number(
        media.size_bytes,
      ),
  };
}

private buildMediaUrl(
  objectKey: string,
  bucketName?: string,
) {
  const publicBaseUrl =
    this.config
      .get<string>(
        'MINIO_PUBLIC_URL',
      )
      ?.replace(
        /\/+$/,
        '',
      );

  const bucket =
    bucketName?.trim() ||
    this.config.get<string>(
      'S3_BUCKET',
    ) ||
    this.config.get<string>(
      'MINIO_BUCKET',
    ) ||
    'flascam-media';

  if (
    !publicBaseUrl
  ) {
    return objectKey;
  }

  const normalizedObjectKey =
    objectKey.replace(
      /^\/+/,
      '',
    );

  return `${publicBaseUrl}/${bucket}/${normalizedObjectKey}`;
}

  /*
   * Helpers
   */

  private async buildPublicWhere(
    query: PublicVideosQueryDto,
  ): Promise<Prisma.videosWhereInput> {
    let associationId:
      | string
      | undefined;

    if (
      query.associationSlug
    ) {
      const association =
        await this.prisma.regional_associations.findFirst({
          where: {
            slug:
              query.associationSlug,

            deleted_at:
              null,
          },

          select: {
            id:
              true,
          },
        });

      if (
        !association
      ) {
        throw new NotFoundException(
          'Association introuvable.',
        );
      }

      associationId =
        association.id;
    }

    return {
      status:
        'PUBLISHED',

      published_at: {
        not:
          null,

        lte:
          new Date(),
      },

      deleted_at:
        null,

      ...(query.provider
        ? {
            provider:
              query.provider,
          }
        : {}),

      ...(associationId
        ? {
            regional_association_id:
              associationId,
          }
        : {}),

      ...(query.search?.trim()
        ? {
            OR: [
              {
                title: {
                  contains:
                    query.search.trim(),

                  mode:
                    'insensitive',
                },
              },
              {
                excerpt: {
                  contains:
                    query.search.trim(),

                  mode:
                    'insensitive',
                },
              },
              {
                description: {
                  contains:
                    query.search.trim(),

                  mode:
                    'insensitive',
                },
              },
            ],
          }
        : {}),
    };
  }

  private extractYoutubeVideoId(
    rawUrl?: string,
  ) {
    const value =
      rawUrl?.trim();

    if (
      !value
    ) {
      throw new BadRequestException(
        'Le lien YouTube est obligatoire.',
      );
    }

    let url:
      URL;

    try {
      url =
        new URL(
          value,
        );
    } catch {
      throw new BadRequestException(
        'Le lien YouTube est invalide.',
      );
    }

    const hostname =
      url.hostname
        .toLowerCase()
        .replace(
          /^www\./,
          '',
        );

    let videoId:
      | string
      | null =
      null;

    if (
      hostname ===
      'youtu.be'
    ) {
      videoId =
        url.pathname
          .split('/')
          .filter(Boolean)[0] ??
        null;
    }

    if (
      [
        'youtube.com',
        'm.youtube.com',
      ].includes(
        hostname,
      )
    ) {
      if (
        url.pathname ===
        '/watch'
      ) {
        videoId =
          url.searchParams.get(
            'v',
          );
      } else {
        const parts =
          url.pathname
            .split('/')
            .filter(Boolean);

        if (
          [
            'embed',
            'shorts',
            'live',
          ].includes(
            parts[0] ??
              '',
          )
        ) {
          videoId =
            parts[1] ??
            null;
        }
      }
    }

    if (
      !videoId ||
      !/^[a-zA-Z0-9_-]{6,20}$/.test(
        videoId,
      )
    ) {
      throw new BadRequestException(
        'Le lien fourni ne correspond pas à une vidéo YouTube valide.',
      );
    }

    return videoId;
  }

  private parseScheduledAt(
    value?: string,
  ) {
    if (
      !value
    ) {
      return null;
    }

    return this.parseRequiredFutureDate(
      value,
    );
  }

  private parseRequiredFutureDate(
    value: string,
  ) {
    const date =
      new Date(
        value,
      );

    if (
      Number.isNaN(
        date.getTime(),
      )
    ) {
      throw new BadRequestException(
        'La date de programmation est invalide.',
      );
    }

    if (
      date.getTime() <=
      Date.now()
    ) {
      throw new BadRequestException(
        'La date de programmation doit être située dans le futur.',
      );
    }

    return date;
  }

  private async findExistingVideo(
    id: string,
  ) {
    const video =
      await this.prisma.videos.findFirst({
        where: {
          id,

          deleted_at:
            null,
        },
      });

    if (
      !video
    ) {
      throw new NotFoundException(
        'Vidéo introuvable.',
      );
    }

    return video;
  }

  private async findAssociationVideo(
    id: string,
    associationId: string,
  ) {
    const video =
      await this.prisma.videos.findFirst({
        where: {
          id,

          regional_association_id:
            associationId,

          deleted_at:
            null,
        },
      });

    if (
      !video
    ) {
      throw new NotFoundException(
        'Vidéo introuvable.',
      );
    }

    return video;
  }

  private getRequiredAssociationId(
    user: AuthUser,
  ) {
    if (
      !user.regionalAssociationId
    ) {
      throw new ForbiddenException(
        'Aucune association n’est rattachée à ce compte.',
      );
    }

    return user.regionalAssociationId;
  }

  private async writeAudit(
    request: Request,
    user: AuthUser,
    action: string,
    entityId: string,
    description: string,
    metadata?: Prisma.InputJsonObject,
  ) {
    await this.auditLogs.log({
      userId:
        user.id,

      action,

      entityType:
        'VIDEO',

      entityId,

      description,

      metadata,

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });
  }
}