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
  AdminNewsQueryDto,
} from './dto/admin-news-query.dto';

import {
  AssociationNewsQueryDto,
} from './dto/association-news-query.dto';

import {
  PublicNewsQueryDto,
} from './dto/public-news-query.dto';

import {
  ScheduleNewsPublicationDto,
} from './dto/schedule-news-publication.dto';

import {
  UpdateNewsStatusDto,
} from './dto/update-news-status.dto';

import {
  UpsertNewsArticleDto,
} from './dto/upsert-news-article.dto';

import {
  RejectNewsArticleDto,
} from './dto/reject-news-article.dto';

type NewsArticleRecord = {
  id: string;
  content_type: string;
  event_category: string | null;
  status: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  event_start_at: Date | null;
  event_end_at: Date | null;
  event_location: string | null;
  seo_title: string | null;
  seo_description: string | null;
  published_at: Date | null;
  scheduled_at: Date | null;
  regional_association_id: string | null;
  submitted_at: Date | null;
  reviewed_at: Date | null;
  reviewed_by_user_id: string | null;
rejection_reason: string | null;

regional_associations?: {
  id: string;
  name: string;
  acronym: string | null;
  slug: string;
} | null;

created_at: Date;
updated_at: Date;
};

type PublishableNewsArticle = {
  title: string;
  excerpt: string | null;
  body: string | null;
  content_type: string;
  event_start_at: Date | null;
};

@Injectable()
export class NewsService {
  private readonly logger =
    new Logger(
      NewsService.name,
    );

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    private readonly config: ConfigService,
  ) {}

  async getPublicNews(
    query: PublicNewsQueryDto,
  ) {
    const page =
      query.page;

    const limit =
      query.limit;

    const skip =
      (page - 1) *
      limit;

    const where =
      this.buildPublicWhere(
        query,
      );

    const [
      articles,
      total,
    ] =
      await Promise.all([
        this.prisma.news_articles.findMany({
          where,

          orderBy: [
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
          take: limit,
        }),

        this.prisma.news_articles.count({
          where,
        }),
      ]);

    const formatted =
      await this.formatArticles(
        articles,
      );

    return {
      items:
        formatted,

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

  async getLatestPublicNews() {
    const articles =
      await this.prisma.news_articles.findMany({
        where: {
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

        orderBy: [
          {
            published_at:
              'desc',
          },
          {
            created_at:
              'desc',
          },
        ],

        take:
          10,
      });

    return this.formatArticles(
      articles,
    );
  }

  async getPublicNewsBySlug(
    slug: string,
  ) {
const article =
  await this.prisma.news_articles.findFirst({
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

    include: {
      regional_associations: {
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
      },
    },
  });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

    return this.formatArticle(
      article,
    );
  }

  async getAssociationNews(
    query: AssociationNewsQueryDto,
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
      Prisma.news_articlesWhereInput = {
      regional_association_id:
        associationId,

      deleted_at:
        null,

      ...(query.contentType
        ? {
            content_type:
              query.contentType,
          }
        : {}),

      ...(query.status
        ? {
            status:
              query.status,
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
                body: {
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
      articles,
      total,
    ] =
      await Promise.all([
        this.prisma.news_articles.findMany({
          where,

          orderBy: [
            {
              updated_at:
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

        this.prisma.news_articles.count({
          where,
        }),
      ]);

    return {
      items:
        await this.formatArticles(
          articles,
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

  async getAssociationNewsById(
    id: string,
    user: AuthUser,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          regional_association_id:
            associationId,

          deleted_at:
            null,
        },
      });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Publication introuvable.',
      );
    }

    return this.formatArticle(
      article,
    );
  }

  async createAssociationNews(
    dto: UpsertNewsArticleDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    await this.validatePayload(
      dto,
      null,
    );

    const article =
      await this.prisma.$transaction(
        async (
          tx,
        ) => {
          const created =
            await tx.news_articles.create({
              data: {
                content_type:
                  dto.contentType,

                event_category:
                  dto.contentType ===
                  'EVENT'
                    ? dto.eventCategory
                    : null,

                status:
                  'DRAFT',

                title:
                  dto.title.trim(),

                slug:
                  dto.slug.trim(),

                excerpt:
                  dto.excerpt?.trim() ||
                  null,

                body:
                  dto.body?.trim() ||
                  null,

                event_start_at:
                  dto.contentType ===
                    'EVENT' &&
                  dto.eventStartAt
                    ? new Date(
                        dto.eventStartAt,
                      )
                    : null,

                event_end_at:
                  dto.contentType ===
                    'EVENT' &&
                  dto.eventEndAt
                    ? new Date(
                        dto.eventEndAt,
                      )
                    : null,

                event_location:
                  dto.contentType ===
                  'EVENT'
                    ? dto.eventLocation?.trim() ||
                      null
                    : null,

                seo_title:
                  dto.seoTitle?.trim() ||
                  null,

                seo_description:
                  dto.seoDescription?.trim() ||
                  null,

                published_at:
                  null,

                scheduled_at:
                  null,

                regional_association_id:
                  associationId,

                submitted_at:
                  null,

                reviewed_at:
                  null,

                reviewed_by_user_id:
                  null,

                rejection_reason:
                  null,

                created_by_user_id:
                  user.id,

                updated_by_user_id:
                  user.id,
              },
            });

await this.replaceMedia(
  tx,
  created.id,
  dto.media ??
    [],
);

await this.synchronizeArticleVideos(
  tx,
  created.id,
  dto.youtubeVideos ??
    [],
  user.id,
);

return created;
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'ASSOCIATION_NEWS_CREATED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        article.id,

      description:
        `Publication d’association créée : ${article.title}.`,

      metadata: {
        regionalAssociationId:
          associationId,

        contentType:
          article.content_type,
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAssociationNewsById(
      article.id,
      user,
    );
  }

  async updateAssociationNews(
    id: string,
    dto: UpsertNewsArticleDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const existing =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          regional_association_id:
            associationId,

          deleted_at:
            null,
        },
      });

    if (
      !existing
    ) {
      throw new NotFoundException(
        'Publication introuvable.',
      );
    }

    if (
      ![
        'DRAFT',
        'REJECTED',
      ].includes(
        existing.status,
      )
    ) {
      throw new BadRequestException(
        existing.status ===
          'PENDING_REVIEW'
          ? 'La publication ne peut pas être modifiée pendant sa validation.'
          : 'Dépubliez cette publication avant de la modifier.',
      );
    }

    await this.validatePayload(
      dto,
      id,
    );

    const article =
      await this.prisma.$transaction(
        async (
          tx,
        ) => {
          const updated =
            await tx.news_articles.update({
              where: {
                id,
              },

              data: {
                content_type:
                  dto.contentType,

                event_category:
                  dto.contentType ===
                  'EVENT'
                    ? dto.eventCategory
                    : null,

                status:
                  'DRAFT',

                title:
                  dto.title.trim(),

                slug:
                  dto.slug.trim(),

                excerpt:
                  dto.excerpt?.trim() ||
                  null,

                body:
                  dto.body?.trim() ||
                  null,

                event_start_at:
                  dto.contentType ===
                    'EVENT' &&
                  dto.eventStartAt
                    ? new Date(
                        dto.eventStartAt,
                      )
                    : null,

                event_end_at:
                  dto.contentType ===
                    'EVENT' &&
                  dto.eventEndAt
                    ? new Date(
                        dto.eventEndAt,
                      )
                    : null,

                event_location:
                  dto.contentType ===
                  'EVENT'
                    ? dto.eventLocation?.trim() ||
                      null
                    : null,

                seo_title:
                  dto.seoTitle?.trim() ||
                  null,

                seo_description:
                  dto.seoDescription?.trim() ||
                  null,

                published_at:
                  null,

                scheduled_at:
                  null,

                submitted_at:
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
                  new Date(),
              },
            });

await this.replaceMedia(
  tx,
  updated.id,
  dto.media ??
    [],
);

await this.synchronizeArticleVideos(
  tx,
  updated.id,
  dto.youtubeVideos ??
    [],
  user.id,
);

return updated;
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'ASSOCIATION_NEWS_UPDATED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        article.id,

      description:
        `Publication d’association modifiée : ${article.title}.`,

      metadata: {
        regionalAssociationId:
          associationId,
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAssociationNewsById(
      article.id,
      user,
    );
  }

  async submitAssociationNews(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          regional_association_id:
            associationId,

          deleted_at:
            null,
        },
      });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Publication introuvable.',
      );
    }

    if (
      ![
        'DRAFT',
        'REJECTED',
      ].includes(
        article.status,
      )
    ) {
      throw new BadRequestException(
        'Seul un brouillon ou une publication refusée peut être soumis.',
      );
    }

    this.ensureArticleCanBePublished(
      article,
    );

    const submittedAt =
      new Date();

const updated =
  await this.prisma.$transaction(
    async (
      tx,
    ) => {
      const article =
        await tx.news_articles.update({
          where: {
            id,
          },

          data: {
            status:
              'PENDING_REVIEW',

            published_at:
              null,

            scheduled_at:
              null,

            submitted_at:
              submittedAt,

            reviewed_at:
              null,

            reviewed_by_user_id:
              null,

            rejection_reason:
              null,

            updated_by_user_id:
              user.id,

            updated_at:
              submittedAt,
          },
        });

      await this.synchronizeArticleVideoStatus(
        tx,
        article,
      );

      return article;
    },
  );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'ASSOCIATION_NEWS_SUBMITTED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        updated.id,

      description:
        `Publication soumise à validation : ${updated.title}.`,

      metadata: {
        regionalAssociationId:
          associationId,

        submittedAt:
          submittedAt.toISOString(),
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAssociationNewsById(
      updated.id,
      user,
    );
  }

  async unpublishAssociationNews(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          regional_association_id:
            associationId,

          deleted_at:
            null,
        },
      });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Publication introuvable.',
      );
    }

    if (
      article.status !==
      'PUBLISHED'
    ) {
      throw new BadRequestException(
        'Seule une publication publiée peut être dépubliée.',
      );
    }

    const updatedAt =
      new Date();

const updated =
  await this.prisma.$transaction(
    async (
      tx,
    ) => {
      const article =
        await tx.news_articles.update({
          where: {
            id,
          },

          data: {
            status:
              'DRAFT',

            published_at:
              null,

            scheduled_at:
              null,

            submitted_at:
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
              updatedAt,
          },
        });

      await this.synchronizeArticleVideoStatus(
        tx,
        article,
      );

      return article;
    },
  );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'ASSOCIATION_NEWS_UNPUBLISHED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        updated.id,

      description:
        `Publication dépubliée par l’association : ${updated.title}.`,

      metadata: {
        regionalAssociationId:
          associationId,
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAssociationNewsById(
      updated.id,
      user,
    );
  }

  async deleteAssociationNews(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const associationId =
      this.getRequiredAssociationId(
        user,
      );

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          regional_association_id:
            associationId,

          deleted_at:
            null,
        },
      });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Publication introuvable.',
      );
    }

    if (
      ![
        'DRAFT',
        'REJECTED',
      ].includes(
        article.status,
      )
    ) {
      throw new BadRequestException(
        'Seul un brouillon ou une publication refusée peut être supprimé.',
      );
    }

const deletedAt =
  new Date();

await this.prisma.$transaction(
  async (
    tx,
  ) => {
    const deletedArticle =
      await tx.news_articles.update({
        where: {
          id,
        },

        data: {
          status:
            'ARCHIVED',

          published_at:
            null,

          scheduled_at:
            null,

          deleted_at:
            deletedAt,

          updated_by_user_id:
            user.id,

          updated_at:
            deletedAt,
        },
      });

    await this.synchronizeArticleVideoStatus(
      tx,
      deletedArticle,
    );
  },
);

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'ASSOCIATION_NEWS_DELETED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        article.id,

      description:
        `Publication d’association supprimée : ${article.title}.`,

      metadata: {
        regionalAssociationId:
          associationId,
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return {
      success:
        true,
    };
  }  

  async getAdminNews(
    query: AdminNewsQueryDto,
    user: AuthUser,
  ) {
    this.ensureFlascamAdmin(
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
      Prisma.news_articlesWhereInput = {
      deleted_at:
        null,

      ...(query.contentType
        ? {
            content_type:
              query.contentType,
          }
        : {}),

      ...(query.status
        ? {
            status:
              query.status,
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
                body: {
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
      articles,
      total,
    ] =
      await Promise.all([
        this.prisma.news_articles.findMany({
          where,
include: {
  regional_associations: {
    select: {
      id: true,
      name: true,
      acronym: true,
      slug: true,
    },
  },
},
          orderBy: [
            {
              updated_at:
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

        this.prisma.news_articles.count({
          where,
        }),
      ]);

    const formatted =
      await this.formatArticles(
        articles,
      );

    return {
      items:
        formatted,

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

  async getAdminNewsById(
    id: string,
    user: AuthUser,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

const article =
  await this.prisma.news_articles.findFirst({
    where: {
      id,

      deleted_at:
        null,
    },

    include: {
      regional_associations: {
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
      },
    },
  });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

    return this.formatArticle(
      article,
    );
  }

  async createNews(
    dto: UpsertNewsArticleDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

    await this.validatePayload(
      dto,
      null,
    );

    const article =
      await this.prisma.$transaction(
        async (
          tx,
        ) => {
          const created =
            await tx.news_articles.create({
              data: {
                content_type:
                  dto.contentType,

                event_category:
                  dto.contentType ===
                  'EVENT'
                    ? dto.eventCategory
                    : null,

                status:
                  'DRAFT',

                title:
                  dto.title.trim(),

                slug:
                  dto.slug.trim(),

                excerpt:
                  dto.excerpt?.trim() ||
                  null,

                body:
                  dto.body?.trim() ||
                  null,

                event_start_at:
                  dto.contentType ===
                    'EVENT' &&
                  dto.eventStartAt
                    ? new Date(
                        dto.eventStartAt,
                      )
                    : null,

                event_end_at:
                  dto.contentType ===
                    'EVENT' &&
                  dto.eventEndAt
                    ? new Date(
                        dto.eventEndAt,
                      )
                    : null,

                event_location:
                  dto.contentType ===
                  'EVENT'
                    ? dto.eventLocation?.trim() ||
                      null
                    : null,

                seo_title:
                  dto.seoTitle?.trim() ||
                  null,

                seo_description:
                  dto.seoDescription?.trim() ||
                  null,

                published_at:
                  null,

                scheduled_at:
                  null,

                created_by_user_id:
                  user.id,

                updated_by_user_id:
                  user.id,
              },
            });

await this.replaceMedia(
  tx,
  created.id,
  dto.media ??
    [],
);

await this.synchronizeArticleVideos(
  tx,
  created.id,
  dto.youtubeVideos ??
    [],
  user.id,
);

return created;
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NEWS_ARTICLE_CREATED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        article.id,

      description:
        `Actualité créée : ${article.title}.`,

      metadata: {
        contentType:
          article.content_type,
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAdminNewsById(
      article.id,
      user,
    );
  }

  async updateNews(
    id: string,
    dto: UpsertNewsArticleDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

    const existing =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          deleted_at:
            null,
        },
      });

    if (
      !existing
    ) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

    await this.validatePayload(
      dto,
      id,
    );

    const article =
      await this.prisma.$transaction(
        async (
          tx,
        ) => {
          const updated =
            await tx.news_articles.update({
              where: {
                id,
              },

              data: {
                content_type:
                  dto.contentType,

                event_category:
                  dto.contentType ===
                  'EVENT'
                    ? dto.eventCategory
                    : null,

                title:
                  dto.title.trim(),

                slug:
                  dto.slug.trim(),

                excerpt:
                  dto.excerpt?.trim() ||
                  null,

                body:
                  dto.body?.trim() ||
                  null,

                event_start_at:
                  dto.contentType ===
                    'EVENT' &&
                  dto.eventStartAt
                    ? new Date(
                        dto.eventStartAt,
                      )
                    : null,

                event_end_at:
                  dto.contentType ===
                    'EVENT' &&
                  dto.eventEndAt
                    ? new Date(
                        dto.eventEndAt,
                      )
                    : null,

                event_location:
                  dto.contentType ===
                  'EVENT'
                    ? dto.eventLocation?.trim() ||
                      null
                    : null,

                seo_title:
                  dto.seoTitle?.trim() ||
                  null,

                seo_description:
                  dto.seoDescription?.trim() ||
                  null,

                updated_by_user_id:
                  user.id,

                updated_at:
                  new Date(),
              },
            });

await this.replaceMedia(
  tx,
  updated.id,
  dto.media ??
    [],
);

await this.synchronizeArticleVideos(
  tx,
  updated.id,
  dto.youtubeVideos ??
    [],
  user.id,
);

return updated;
        },
      );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NEWS_ARTICLE_UPDATED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        article.id,

      description:
        `Actualité modifiée : ${article.title}.`,

      metadata: {
        contentType:
          article.content_type,
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAdminNewsById(
      article.id,
      user,
    );
  }

  async updateNewsStatus(
    id: string,
    dto: UpdateNewsStatusDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

    const existing =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          deleted_at:
            null,
        },
      });

    if (
      !existing
    ) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

    if (
      dto.status ===
      'PUBLISHED'
    ) {
      this.ensureArticleCanBePublished(
        existing,
      );
    }

    const now =
      new Date();

const article =
  await this.prisma.$transaction(
    async (
      tx,
    ) => {
      const updatedArticle =
        await tx.news_articles.update({
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

            updated_by_user_id:
              user.id,

            updated_at:
              now,
          },
        });

      await this.synchronizeArticleVideoStatus(
        tx,
        updatedArticle,
      );

      return updatedArticle;
    },
  );

    if (
      dto.status ===
      'PUBLISHED'
    ) {
      const publiclyVisibleArticle =
        await this.prisma.news_articles.findFirst({
          where: {
            id:
              article.id,

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

          select: {
            id:
              true,
          },
        });
        

      if (
        !publiclyVisibleArticle
      ) {
        throw new BadRequestException(
          'L’actualité a été publiée, mais elle ne satisfait pas les conditions de visibilité publique.',
        );
      }
const hiddenPublishedVideo =
  await this.prisma.videos.findFirst({
    where: {
      news_article_id:
        article.id,

      source_type:
        'NEWS',

      deleted_at:
        null,

      OR: [
        {
          status: {
            not:
              'PUBLISHED',
          },
        },
        {
          published_at:
            null,
        },
      ],
    },

    select: {
      id:
        true,
    },
  });

if (
  hiddenPublishedVideo
) {
  throw new BadRequestException(
    'L’actualité est publiée, mais au moins une de ses vidéos n’a pas été correctement publiée.',
  );
}      
    }

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NEWS_ARTICLE_STATUS_UPDATED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        article.id,

      description:
        `Statut de l’actualité modifié : ${dto.status}.`,

      metadata: {
        previousStatus:
          existing.status,

        newStatus:
          dto.status,

        previousScheduledAt:
          existing.scheduled_at
            ?.toISOString() ??
          null,
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAdminNewsById(
      article.id,
      user,
    );
  }

  async approveAssociationNews(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          regional_association_id: {
            not:
              null,
          },

          deleted_at:
            null,
        },
      });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Publication d’association introuvable.',
      );
    }

    if (
      article.status !==
      'PENDING_REVIEW'
    ) {
      throw new BadRequestException(
        'Seule une publication en attente de validation peut être approuvée.',
      );
    }

    this.ensureArticleCanBePublished(
      article,
    );

    const reviewedAt =
      new Date();

const updated =
  await this.prisma.$transaction(
    async (
      tx,
    ) => {
      const approvedArticle =
        await tx.news_articles.update({
          where: {
            id,
          },

          data: {
            status:
              'PUBLISHED',

            published_at:
              reviewedAt,

            scheduled_at:
              null,

            reviewed_at:
              reviewedAt,

            reviewed_by_user_id:
              user.id,

            rejection_reason:
              null,

            updated_by_user_id:
              user.id,

            updated_at:
              reviewedAt,
          },
        });

      await this.synchronizeArticleVideoStatus(
        tx,
        approvedArticle,
      );

      return approvedArticle;
    },
  );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'ASSOCIATION_NEWS_APPROVED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        updated.id,

      description:
        `Publication d’association validée : ${updated.title}.`,

      metadata: {
        regionalAssociationId:
          updated.regional_association_id,

        reviewedAt:
          reviewedAt.toISOString(),
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAdminNewsById(
      updated.id,
      user,
    );
  }

  async rejectAssociationNews(
    id: string,
    dto: RejectNewsArticleDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          regional_association_id: {
            not:
              null,
          },

          deleted_at:
            null,
        },
      });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Publication d’association introuvable.',
      );
    }

    if (
      article.status !==
      'PENDING_REVIEW'
    ) {
      throw new BadRequestException(
        'Seule une publication en attente de validation peut être refusée.',
      );
    }

    const reason =
      dto.reason.trim();

    const reviewedAt =
      new Date();

const updated =
  await this.prisma.$transaction(
    async (
      tx,
    ) => {
      const rejectedArticle =
        await tx.news_articles.update({
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
              reviewedAt,

            reviewed_by_user_id:
              user.id,

            rejection_reason:
              reason,

            updated_by_user_id:
              user.id,

            updated_at:
              reviewedAt,
          },
        });

      await this.synchronizeArticleVideoStatus(
        tx,
        rejectedArticle,
      );

      return rejectedArticle;
    },
  );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'ASSOCIATION_NEWS_REJECTED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        updated.id,

      description:
        `Publication d’association refusée : ${updated.title}.`,

      metadata: {
        regionalAssociationId:
          updated.regional_association_id,

        reason,
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAdminNewsById(
      updated.id,
      user,
    );
  }  

  async scheduleNewsPublication(
    id: string,
    dto: ScheduleNewsPublicationDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          deleted_at:
            null,
        },
      });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

if (
  article.regional_association_id
) {
  throw new BadRequestException(
    'Une publication d’association doit être validée avant publication et ne peut pas être programmée.',
  );
}    

    if (
      article.status ===
      'ARCHIVED'
    ) {
      throw new BadRequestException(
        'Une actualité archivée ne peut pas être programmée.',
      );
    }

    this.ensureArticleCanBePublished(
      article,
    );

    const scheduledAt =
      new Date(
        dto.scheduledAt,
      );

    if (
      Number.isNaN(
        scheduledAt.getTime(),
      )
    ) {
      throw new BadRequestException(
        'La date de publication programmée est invalide.',
      );
    }

    const minimumDate =
      new Date(
        Date.now() +
          60_000,
      );

    if (
      scheduledAt <
      minimumDate
    ) {
      throw new BadRequestException(
        'La publication doit être programmée au moins une minute dans le futur.',
      );
    }

const updated =
  await this.prisma.$transaction(
    async (
      tx,
    ) => {
      const scheduledArticle =
        await tx.news_articles.update({
          where: {
            id,
          },

          data: {
            status:
              'DRAFT',

            published_at:
              null,

            scheduled_at:
              scheduledAt,

            updated_by_user_id:
              user.id,

            updated_at:
              new Date(),
          },
        });

      await this.synchronizeArticleVideoStatus(
        tx,
        scheduledArticle,
      );

      return scheduledArticle;
    },
  );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NEWS_ARTICLE_SCHEDULED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        updated.id,

      description:
        `Publication programmée : ${updated.title}.`,

      metadata: {
        previousScheduledAt:
          article.scheduled_at
            ?.toISOString() ??
          null,

        scheduledAt:
          scheduledAt.toISOString(),
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAdminNewsById(
      updated.id,
      user,
    );
  }

  async cancelNewsPublicationSchedule(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          deleted_at:
            null,
        },
      });

    if (
      !article
    ) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

    if (
      !article.scheduled_at
    ) {
      throw new BadRequestException(
        'Cette actualité n’est pas programmée.',
      );
    }

const updated =
  await this.prisma.$transaction(
    async (
      tx,
    ) => {
      const cancelledArticle =
        await tx.news_articles.update({
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

      await this.synchronizeArticleVideoStatus(
        tx,
        cancelledArticle,
      );

      return cancelledArticle;
    },
  );

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NEWS_ARTICLE_SCHEDULE_CANCELLED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        updated.id,

      description:
        `Programmation annulée : ${updated.title}.`,

      metadata: {
        previousScheduledAt:
          article.scheduled_at.toISOString(),
      },

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return this.getAdminNewsById(
      updated.id,
      user,
    );
  }

  @Cron(
    CronExpression.EVERY_MINUTE,
  )
  async publishScheduledNews() {
    const now =
      new Date();

    try {
      const candidates =
        await this.prisma.news_articles.findMany({
          where: {
            status:
              'DRAFT',

            scheduled_at: {
              not:
                null,

              lte:
                now,
            },

            deleted_at:
              null,
          },

          orderBy: {
            scheduled_at:
              'asc',
          },

          take:
            50,
        });

      for (
        const article
        of candidates
      ) {
        try {
          this.ensureArticleCanBePublished(
            article,
          );

          const publicationDate =
            new Date();

const result =
  await this.prisma.$transaction(
    async (
      tx,
    ) => {
      const updateResult =
        await tx.news_articles.updateMany({
          where: {
            id:
              article.id,

            status:
              'DRAFT',

            scheduled_at: {
              not:
                null,

              lte:
                publicationDate,
            },

            deleted_at:
              null,
          },

          data: {
            status:
              'PUBLISHED',

            published_at:
              publicationDate,

            scheduled_at:
              null,

            updated_at:
              publicationDate,
          },
        });

      if (
        updateResult.count !==
        1
      ) {
        return updateResult;
      }

      const publishedArticle =
        await tx.news_articles.findUnique({
          where: {
            id:
              article.id,
          },
        });

      if (
        !publishedArticle
      ) {
        throw new NotFoundException(
          'L’actualité programmée est introuvable après sa publication.',
        );
      }

      await this.synchronizeArticleVideoStatus(
        tx,
        publishedArticle,
      );

      return updateResult;
    },
  );

          if (
            result.count ===
            1
          ) {
            this.logger.log(
              `Actualité publiée automatiquement : ${article.id} - ${article.title}`,
            );

            await this.auditLogs.log({
              action:
                'NEWS_ARTICLE_AUTO_PUBLISHED',

              entityType:
                'NEWS_ARTICLE',

              entityId:
                article.id,

              description:
                `Actualité publiée automatiquement : ${article.title}.`,

              metadata: {
                publishedAt:
                  publicationDate.toISOString(),
              },
            });
          }
        } catch (
          caughtError
        ) {
          const message =
            caughtError instanceof
              Error
              ? caughtError.message
              : 'Erreur inconnue';

          this.logger.error(
            `Publication automatique impossible pour ${article.id} : ${message}`,
          );
        }
      }
    } catch (
      caughtError
    ) {
      const message =
        caughtError instanceof
          Error
          ? caughtError.message
          : 'Erreur inconnue';

      this.logger.error(
        `Échec du traitement des publications programmées : ${message}`,
      );
    }
  }

  async deleteNews(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(
      user,
    );

    const existing =
      await this.prisma.news_articles.findFirst({
        where: {
          id,

          deleted_at:
            null,
        },
      });

    if (
      !existing
    ) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

const deletedAt =
  new Date();

await this.prisma.$transaction(
  async (
    tx,
  ) => {
    const deletedArticle =
      await tx.news_articles.update({
        where: {
          id,
        },

        data: {
          status:
            'ARCHIVED',

          published_at:
            null,

          scheduled_at:
            null,

          deleted_at:
            deletedAt,

          updated_by_user_id:
            user.id,

          updated_at:
            deletedAt,
        },
      });

    await this.synchronizeArticleVideoStatus(
      tx,
      deletedArticle,
    );
  },
);

    await this.auditLogs.log({
      userId:
        user.id,

      action:
        'NEWS_ARTICLE_DELETED',

      entityType:
        'NEWS_ARTICLE',

      entityId:
        existing.id,

      description:
        `Actualité supprimée : ${existing.title}.`,

      ipAddress:
        request.ip,

      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return {
      success:
        true,
    };
  }

  private buildPublicWhere(
    query: PublicNewsQueryDto,
  ): Prisma.news_articlesWhereInput {
    const now =
      new Date();

    const andConditions:
      Prisma.news_articlesWhereInput[] = [];

    const search =
      query.search?.trim();

    if (
      search
    ) {
      andConditions.push({
        OR: [
          {
            title: {
              contains:
                search,

              mode:
                'insensitive',
            },
          },
          {
            excerpt: {
              contains:
                search,

              mode:
                'insensitive',
            },
          },
          {
            body: {
              contains:
                search,

              mode:
                'insensitive',
            },
          },
          {
            event_location: {
              contains:
                search,

              mode:
                'insensitive',
            },
          },
        ],
      });
    }

    if (
      query.eventPeriod ===
      'UPCOMING'
    ) {
      andConditions.push({
        event_start_at: {
          gt:
            now,
        },
      });
    }

    if (
      query.eventPeriod ===
      'ONGOING'
    ) {
      andConditions.push({
        event_start_at: {
          lte:
            now,
        },

        OR: [
          {
            event_end_at: {
              gte:
                now,
            },
          },
          {
            event_end_at:
              null,
          },
        ],
      });
    }

    if (
      query.eventPeriod ===
      'PAST'
    ) {
      andConditions.push({
        OR: [
          {
            event_end_at: {
              lt:
                now,
            },
          },
          {
            event_end_at:
              null,

            event_start_at: {
              lt:
                now,
            },
          },
        ],
      });
    }

    return {
      status:
        'PUBLISHED',

      published_at: {
        not:
          null,

        lte:
          now,
      },

      deleted_at:
        null,

      ...(query.contentType
        ? {
            content_type:
              query.contentType,
          }
        : {}),

      ...(query.eventCategory
        ? {
            content_type:
              'EVENT',

            event_category:
              query.eventCategory,
          }
        : {}),

      ...(query.eventPeriod
        ? {
            content_type:
              'EVENT',
          }
        : {}),

      ...(andConditions.length
        ? {
            AND:
              andConditions,
          }
        : {}),
    };
  }

  private async validatePayload(
    dto: UpsertNewsArticleDto,
    articleId: string | null,
  ) {
    const title =
      dto.title.trim();

    const slug =
      dto.slug.trim();

    if (
      !title
    ) {
      throw new BadRequestException(
        'Le titre est obligatoire.',
      );
    }

    if (
      !slug
    ) {
      throw new BadRequestException(
        'Le slug est obligatoire.',
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

    if (
      dto.contentType ===
        'EVENT' &&
      !dto.eventStartAt
    ) {
      throw new BadRequestException(
        'La date de début est obligatoire pour un événement.',
      );
    }

    if (
      dto.contentType !==
        'EVENT' &&
      (
        dto.eventCategory ||
        dto.eventStartAt ||
        dto.eventEndAt ||
        dto.eventLocation
      )
    ) {
      throw new BadRequestException(
        'Les informations d’événement sont autorisées uniquement pour le type Événement.',
      );
    }

    if (
      dto.eventStartAt &&
      Number.isNaN(
        new Date(
          dto.eventStartAt,
        ).getTime(),
      )
    ) {
      throw new BadRequestException(
        'La date de début de l’événement est invalide.',
      );
    }

    if (
      dto.eventEndAt &&
      Number.isNaN(
        new Date(
          dto.eventEndAt,
        ).getTime(),
      )
    ) {
      throw new BadRequestException(
        'La date de fin de l’événement est invalide.',
      );
    }

    if (
      dto.eventStartAt &&
      dto.eventEndAt &&
      new Date(
        dto.eventEndAt,
      ) <
        new Date(
          dto.eventStartAt,
        )
    ) {
      throw new BadRequestException(
        'La date de fin doit être postérieure ou égale à la date de début.',
      );
    }

    const slugOwner =
      await this.prisma.news_articles.findFirst({
        where: {
          slug,

          deleted_at:
            null,

          ...(articleId
            ? {
                NOT: {
                  id:
                    articleId,
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
      slugOwner
    ) {
      throw new ConflictException(
        'Une autre actualité utilise déjà ce slug.',
      );
    }

    await this.validateMedia(
      dto.media ??
        [],
    );

await this.validateMedia(
  dto.media ??
    [],
);

this.validateYoutubeVideos(
  dto.youtubeVideos ??
    [],
);    
  }

  private async validateMedia(
    media:
      UpsertNewsArticleDto['media'],
  ) {
    const items =
      media ??
      [];

    if (
      !items.length
    ) {
      return;
    }

    const assetIds =
      items.map(
        (
          item,
        ) =>
          item.mediaAssetId,
      );

    const uniqueAssetIds =
      new Set(
        assetIds,
      );

    if (
      uniqueAssetIds.size !==
      assetIds.length
    ) {
      throw new BadRequestException(
        'Un même média ne peut pas être ajouté plusieurs fois à une actualité.',
      );
    }

    const orders =
      items.map(
        (
          item,
        ) =>
          item.displayOrder,
      );

    const uniqueOrders =
      new Set(
        orders,
      );

    if (
      uniqueOrders.size !==
      orders.length
    ) {
      throw new BadRequestException(
        'Deux médias ne peuvent pas avoir le même ordre d’affichage.',
      );
    }

    const assets =
      await this.prisma.media_assets.findMany({
        where: {
          id: {
            in:
              assetIds,
          },

          deleted_at:
            null,

          status:
            'PUBLISHED',

          visibility:
            'PUBLIC',

          media_type: {
            in: [
              'IMAGE',
              'VIDEO',
            ],
          },
        },

        select: {
          id:
            true,
        },
      });

    if (
      assets.length !==
      assetIds.length
    ) {
      throw new BadRequestException(
        'Un ou plusieurs médias sont introuvables, privés ou non publiés.',
      );
    }
  }

private validateYoutubeVideos(
  videos:
    NonNullable<
      UpsertNewsArticleDto['youtubeVideos']
    >,
) {
  if (
    !videos.length
  ) {
    return;
  }

  const videoIds =
    videos.map(
      (
        video,
      ) =>
        this.extractYoutubeVideoId(
          video.url,
        ),
    );

  const uniqueVideoIds =
    new Set(
      videoIds,
    );

  if (
    uniqueVideoIds.size !==
    videoIds.length
  ) {
    throw new BadRequestException(
      'Une même vidéo YouTube ne peut pas être ajoutée plusieurs fois à une actualité.',
    );
  }

  const displayOrders =
    videos.map(
      (
        video,
      ) =>
        video.displayOrder,
    );

  const uniqueDisplayOrders =
    new Set(
      displayOrders,
    );

  if (
    uniqueDisplayOrders.size !==
    displayOrders.length
  ) {
    throw new BadRequestException(
      'Deux vidéos YouTube ne peuvent pas avoir le même ordre d’affichage.',
    );
  }
}

private extractYoutubeVideoId(
  rawUrl: string,
) {
  const value =
    rawUrl.trim();

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
    string | null =
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

  private ensureArticleCanBePublished(
    article: PublishableNewsArticle,
  ) {
    if (
      !article.title.trim()
    ) {
      throw new BadRequestException(
        'Le titre est obligatoire avant publication.',
      );
    }

    if (
      !article.excerpt?.trim()
    ) {
      throw new BadRequestException(
        'Le résumé est obligatoire avant publication.',
      );
    }

    if (
      !article.body?.trim()
    ) {
      throw new BadRequestException(
        'Le contenu est obligatoire avant publication.',
      );
    }

    if (
      article.content_type ===
        'EVENT' &&
      !article.event_start_at
    ) {
      throw new BadRequestException(
        'La date de début est obligatoire avant la publication d’un événement.',
      );
    }
  }

  private async replaceMedia(
    tx: Prisma.TransactionClient,
    articleId: string,
    media:
      NonNullable<
        UpsertNewsArticleDto['media']
      >,
  ) {
    await tx.news_article_media.deleteMany({
      where: {
        news_article_id:
          articleId,
      },
    });

    if (
      !media.length
    ) {
      return;
    }

    await tx.news_article_media.createMany({
      data:
        media.map(
          (
            item,
          ) => ({
            news_article_id:
              articleId,

            media_asset_id:
              item.mediaAssetId,

            display_order:
              item.displayOrder,

            alt_text:
              item.altText?.trim() ||
              null,

            caption:
              item.caption?.trim() ||
              null,

            updated_at:
              new Date(),
          }),
        ),
    });
  }

private async synchronizeArticleVideos(
  tx: Prisma.TransactionClient,
  articleId: string,
  youtubeVideos:
    NonNullable<
      UpsertNewsArticleDto['youtubeVideos']
    >,
  userId: string | null,
) {
  const article =
    await tx.news_articles.findFirst({
      where: {
        id:
          articleId,

        deleted_at:
          null,
      },
    });

  if (
    !article
  ) {
    throw new NotFoundException(
      'Actualité introuvable pendant la synchronisation des vidéos.',
    );
  }

  const articleMedia =
    await tx.news_article_media.findMany({
      where: {
        news_article_id:
          articleId,
      },

      include: {
        media_assets:
          true,
      },

      orderBy: [
        {
          display_order:
            'asc',
        },
        {
          created_at:
            'asc',
        },
      ],
    });

  const importedVideos =
    articleMedia.filter(
      (
        item,
      ) =>
        item.media_assets.media_type ===
        'VIDEO',
    );

  const firstImage =
    articleMedia.find(
      (
        item,
      ) =>
        item.media_assets.media_type ===
        'IMAGE',
    );

  /*
   * Les vidéos issues d’une actualité sont des données dérivées.
   * Elles peuvent donc être supprimées puis reconstruites
   * à chaque modification de l’actualité.
   *
   * Cela évite :
   * - les doublons ;
   * - les vidéos retirées qui restent dans la vidéothèque ;
   * - les anciennes miniatures ;
   * - les anciennes associations.
   */
  await tx.videos.deleteMany({
    where: {
      news_article_id:
        articleId,

      source_type:
        'NEWS',
    },
  });

  const videoStatus =
    article.status ===
    'PUBLISHED'
      ? 'PUBLISHED'
      : article.status ===
          'ARCHIVED'
      ? 'ARCHIVED'
      : article.status ===
          'PENDING_REVIEW'
      ? 'PENDING_REVIEW'
      : article.status ===
          'REJECTED'
      ? 'REJECTED'
      : 'DRAFT';

  const publishedAt =
    videoStatus ===
    'PUBLISHED'
      ? article.published_at ??
        new Date()
      : null;

  const now =
    new Date();

  const generatedVideos:
    Prisma.videosCreateManyInput[] =
      [];

  importedVideos.forEach(
    (
      item,
      index,
    ) => {
      const asset =
        item.media_assets;

      const title =
        item.caption?.trim() ||
        item.alt_text?.trim() ||
        asset.title?.trim() ||
        `${article.title} — vidéo ${index + 1}`;

      generatedVideos.push({
        regional_association_id:
          article.regional_association_id,

        news_article_id:
          article.id,

        created_by_user_id:
          userId ??
          article.created_by_user_id,

        updated_by_user_id:
          userId ??
          article.updated_by_user_id,

        reviewed_by_user_id:
          article.reviewed_by_user_id,

        media_asset_id:
          asset.id,

        thumbnail_media_asset_id:
          firstImage?.media_asset_id ??
          null,

        source_type:
          'NEWS',

        provider:
          'UPLOADED',

        status:
          videoStatus,

        title,

        /*
         * L’identifiant du média rend le slug stable et unique,
         * même si plusieurs vidéos ont le même titre.
         */
        slug:
          `${article.slug}-video-${asset.id
            .replace(
              /-/g,
              '',
            )
            .slice(
              0,
              12,
            )}`,

        excerpt:
          item.caption?.trim() ||
          article.excerpt,

        description:
          article.body,

        external_url:
          null,

        external_video_id:
          null,

        duration_seconds:
          asset.duration_seconds,

        seo_title:
          article.seo_title,

        seo_description:
          article.seo_description,

        display_order:
          item.display_order,

        is_featured:
          false,

        published_at:
          publishedAt,

        scheduled_at:
          null,

        submitted_at:
          article.submitted_at,

        reviewed_at:
          article.reviewed_at,

        rejection_reason:
          article.rejection_reason,

        created_at:
          now,

        updated_at:
          now,

        deleted_at:
          null,
      });
    },
  );

  youtubeVideos.forEach(
    (
      item,
      index,
    ) => {
      const youtubeId =
        this.extractYoutubeVideoId(
          item.url,
        );

      const title =
        item.title?.trim() ||
        `${article.title} — vidéo YouTube ${index + 1}`;

      generatedVideos.push({
        regional_association_id:
          article.regional_association_id,

        news_article_id:
          article.id,

        created_by_user_id:
          userId ??
          article.created_by_user_id,

        updated_by_user_id:
          userId ??
          article.updated_by_user_id,

        reviewed_by_user_id:
          article.reviewed_by_user_id,

        media_asset_id:
          null,

        thumbnail_media_asset_id:
          firstImage?.media_asset_id ??
          null,

        source_type:
          'NEWS',

        provider:
          'YOUTUBE',

        status:
          videoStatus,

        title,

        slug:
          `${article.slug}-youtube-${youtubeId.toLowerCase()}`,

        excerpt:
          item.description?.trim() ||
          article.excerpt,

        description:
          item.description?.trim() ||
          article.body,

        external_url:
          item.url.trim(),

        external_video_id:
          youtubeId,

        duration_seconds:
          null,

        seo_title:
          article.seo_title,

        seo_description:
          article.seo_description,

        display_order:
          item.displayOrder,

        is_featured:
          false,

        published_at:
          publishedAt,

        scheduled_at:
          null,

        submitted_at:
          article.submitted_at,

        reviewed_at:
          article.reviewed_at,

        rejection_reason:
          article.rejection_reason,

        created_at:
          now,

        updated_at:
          now,

        deleted_at:
          null,
      });
    },
  );

  if (
    !generatedVideos.length
  ) {
    return;
  }

  await tx.videos.createMany({
    data:
      generatedVideos,
  });
}  

private async synchronizeArticleVideoStatus(
  tx: Prisma.TransactionClient,
  article: {
    id: string;
    status: string;
    published_at: Date | null;
    scheduled_at: Date | null;
    submitted_at: Date | null;
    reviewed_at: Date | null;
    reviewed_by_user_id: string | null;
    rejection_reason: string | null;
    updated_by_user_id: string | null;
    deleted_at: Date | null;
  },
) {
  const isDeleted =
    article.deleted_at !==
    null;

  const videoStatus =
    isDeleted
      ? 'ARCHIVED'
      : article.status ===
          'PUBLISHED'
      ? 'PUBLISHED'
      : article.status ===
          'PENDING_REVIEW'
      ? 'PENDING_REVIEW'
      : article.status ===
          'REJECTED'
      ? 'REJECTED'
      : article.status ===
          'ARCHIVED'
      ? 'ARCHIVED'
      : 'DRAFT';

  const publishedAt =
    videoStatus ===
    'PUBLISHED'
      ? article.published_at ??
        new Date()
      : null;

  await tx.videos.updateMany({
    where: {
      news_article_id:
        article.id,

      source_type:
        'NEWS',
    },

    data: {
      status:
        videoStatus,

      published_at:
        publishedAt,

      /*
       * Une vidéo provenant d’une actualité ne possède jamais
       * de programmation autonome. Elle dépend exclusivement
       * de la programmation de l’actualité.
       */
      scheduled_at:
        null,

      submitted_at:
        article.submitted_at,

      reviewed_at:
        article.reviewed_at,

      reviewed_by_user_id:
        article.reviewed_by_user_id,

      rejection_reason:
        article.rejection_reason,

      updated_by_user_id:
        article.updated_by_user_id,

      deleted_at:
        isDeleted
          ? article.deleted_at
          : null,

      updated_at:
        new Date(),
    },
  });
}

private async formatArticles(
  articles: NewsArticleRecord[],
) {
  if (
    !articles.length
  ) {
    return [];
  }

  const articleIds =
    articles.map(
      (
        article,
      ) =>
        article.id,
    );

  const [
    media,
    youtubeVideos,
  ] =
    await Promise.all([
      this.prisma.news_article_media.findMany({
        where: {
          news_article_id: {
            in:
              articleIds,
          },
        },

        include: {
          media_assets:
            true,
        },

        orderBy: [
          {
            display_order:
              'asc',
          },
          {
            created_at:
              'asc',
          },
        ],
      }),

      this.prisma.videos.findMany({
        where: {
          news_article_id: {
            in:
              articleIds,
          },

          source_type:
            'NEWS',

          provider:
            'YOUTUBE',

          deleted_at:
            null,
        },

        orderBy: [
          {
            display_order:
              'asc',
          },
          {
            created_at:
              'asc',
          },
        ],

        select: {
          id:
            true,

          news_article_id:
            true,

          external_video_id:
            true,

          title:
            true,
        },
      }),
    ]);

  const mediaByArticle =
    new Map<
      string,
      ReturnType<
        NewsService['formatMedia']
      >[]
    >();

  for (
    const item
    of media
  ) {
    const current =
      mediaByArticle.get(
        item.news_article_id,
      ) ??
      [];

    current.push(
      this.formatMedia(
        item,
      ),
    );

    mediaByArticle.set(
      item.news_article_id,
      current,
    );
  }

  const youtubeVideoByArticle =
    new Map<
      string,
      {
        id: string;
        externalVideoId: string;
        title: string;
      }
    >();

  for (
    const video
    of youtubeVideos
  ) {
    if (
      !video.news_article_id ||
      !video.external_video_id ||
      youtubeVideoByArticle.has(
        video.news_article_id,
      )
    ) {
      continue;
    }

    youtubeVideoByArticle.set(
      video.news_article_id,
      {
        id:
          video.id,

        externalVideoId:
          video.external_video_id,

        title:
          video.title,
      },
    );
  }

  return articles.map(
    (
      article,
    ) =>
      this.formatArticleData(
        article,

        mediaByArticle.get(
          article.id,
        ) ??
          [],

        youtubeVideoByArticle.get(
          article.id,
        ) ??
          null,
      ),
  );
}

private async formatArticle(
  article: NewsArticleRecord,
) {
  const [
    media,
    youtubeVideos,
  ] =
    await Promise.all([
      this.prisma.news_article_media.findMany({
        where: {
          news_article_id:
            article.id,
        },

        include: {
          media_assets:
            true,
        },

        orderBy: [
          {
            display_order:
              'asc',
          },
          {
            created_at:
              'asc',
          },
        ],
      }),

      this.prisma.videos.findMany({
        where: {
          news_article_id:
            article.id,

          source_type:
            'NEWS',

          provider:
            'YOUTUBE',

          deleted_at:
            null,
        },

        orderBy: [
          {
            display_order:
              'asc',
          },
          {
            created_at:
              'asc',
          },
        ],

        select: {
          id:
            true,

          external_url:
            true,

          external_video_id:
            true,

          title:
            true,

          excerpt:
            true,

          description:
            true,

          display_order:
            true,
        },
      }),
    ]);

const firstYoutubeVideo =
  youtubeVideos.find(
    (
      video,
    ) =>
      Boolean(
        video.external_video_id,
      ),
  ) ??
  null;    

  return {
...this.formatArticleData(
  article,

  media.map(
    (
      item,
    ) =>
      this.formatMedia(
        item,
      ),
  ),

  firstYoutubeVideo?.external_video_id
    ? {
        id:
          firstYoutubeVideo.id,

        externalVideoId:
          firstYoutubeVideo.external_video_id,

        title:
          firstYoutubeVideo.title,
      }
    : null,
),

    youtubeVideos:
      youtubeVideos.map(
        (
          video,
        ) => ({
          id:
            video.id,

          url:
            video.external_url,

          videoId:
            video.external_video_id,

          embedUrl:
            video.external_video_id
              ? `https://www.youtube-nocookie.com/embed/${video.external_video_id}`
              : null,

          title:
            video.title,

          description:
            video.description ??
            video.excerpt,

          displayOrder:
            video.display_order,
        }),
      ),
  };
}

private formatArticleData(
  article: NewsArticleRecord,
  media: ReturnType<
    NewsService['formatMedia']
  >[],
  youtubeFallback:
    | {
        id: string;
        externalVideoId: string;
        title: string;
      }
    | null = null,
) {

const youtubePrimaryMedia =
  youtubeFallback
    ? {
        id:
          youtubeFallback.id,

        mediaAssetId:
          youtubeFallback.id,

        mediaType:
          'IMAGE',

        mimeType:
          'image/jpeg',

        url:
          `https://i.ytimg.com/vi/${youtubeFallback.externalVideoId}/hqdefault.jpg`,

        displayOrder:
          0,

        altText:
          youtubeFallback.title ||
          article.title,

        caption:
          null,

        width:
          480,

        height:
          360,

        durationSeconds:
          null,
      }
    : null;  
  return {
    id:
      article.id,

    contentType:
      article.content_type,

    eventCategory:
      article.event_category,

    status:
      article.status,

    title:
      article.title,

    slug:
      article.slug,

    excerpt:
      article.excerpt,

    body:
      article.body,

    eventStartAt:
      article.event_start_at,

    eventEndAt:
      article.event_end_at,

    eventLocation:
      article.event_location,

    eventPeriod:
      this.getEventPeriod(
        article.content_type,
        article.event_start_at,
        article.event_end_at,
      ),

    seoTitle:
      article.seo_title,

    seoDescription:
      article.seo_description,

    publishedAt:
      article.published_at,

    scheduledAt:
      article.scheduled_at,

regionalAssociationId:
  article.regional_association_id,

association:
  article.regional_associations
    ? {
        id:
          article.regional_associations.id,

        name:
          article.regional_associations.name,

        acronym:
          article.regional_associations.acronym,

        slug:
          article.regional_associations.slug,
      }
    : null,

submittedAt:
  article.submitted_at,

    reviewedAt:
      article.reviewed_at,

    reviewedByUserId:
      article.reviewed_by_user_id,

    rejectionReason:
      article.rejection_reason,

    createdAt:
      article.created_at,

    updatedAt:
      article.updated_at,

    media,

primaryMedia:
  media[0] ??
  youtubePrimaryMedia ??
  null,
  };
}

  private formatMedia(
    item: any,
  ) {
    return {
      id:
        item.id,

      mediaAssetId:
        item.media_asset_id,

      mediaType:
        item.media_assets.media_type,

      mimeType:
        item.media_assets.mime_type,

      url:
        this.mediaUrl(
          item.media_assets.object_key,
        ),

      displayOrder:
        item.display_order,

      altText:
        item.alt_text ??
        item.media_assets.alt_text,

      caption:
        item.caption,

      width:
        item.media_assets.width,

      height:
        item.media_assets.height,

      durationSeconds:
        item.media_assets.duration_seconds
          ? Number(
              item.media_assets.duration_seconds,
            )
          : null,
    };
  }

  private getEventPeriod(
    contentType: string,
    startAt: Date | null,
    endAt: Date | null,
  ) {
    if (
      contentType !==
        'EVENT' ||
      !startAt
    ) {
      return null;
    }

    const now =
      new Date();

    if (
      startAt >
      now
    ) {
      return 'UPCOMING';
    }

    if (
      endAt &&
      endAt <
        now
    ) {
      return 'PAST';
    }

    if (
      !endAt &&
      startAt <
        now
    ) {
      return 'PAST';
    }

    return 'ONGOING';
  }

  private getRequiredAssociationId(
    user: AuthUser,
  ) {
    if (
      user.role !==
      'ASSOCIATION_ADMIN'
    ) {
      throw new ForbiddenException(
        'Cette action est réservée aux associations.',
      );
    }

    if (
      !user.regionalAssociationId
    ) {
      throw new ForbiddenException(
        'Aucune association n’est rattachée à ce compte.',
      );
    }

    return user.regionalAssociationId;
  }

  private ensureFlascamAdmin(
    user: AuthUser,
  ) {
    if (
      ![
        'SUPER_ADMIN',
        'FLASCAM_ADMIN',
      ].includes(
        user.role,
      )
    ) {
      throw new ForbiddenException(
        'Seule l’administration FLASCAM peut gérer les actualités.',
      );
    }
  }

  private mediaUrl(
    objectKey: string,
  ) {
    const baseUrl =
      this.config.get<string>(
        'PUBLIC_MEDIA_BASE_URL',
        '',
      );

    if (
      !baseUrl
    ) {
      return objectKey;
    }

    return `${baseUrl.replace(
      /\/$/,
      '',
    )}/${objectKey.replace(
      /^\//,
      '',
    )}`;
  }
}