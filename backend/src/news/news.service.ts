import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import {
  ConfigService,
} from '@nestjs/config';

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
  PublicNewsQueryDto,
} from './dto/public-news-query.dto';

import {
  UpdateNewsStatusDto,
} from './dto/update-news-status.dto';

import {
  UpsertNewsArticleDto,
} from './dto/upsert-news-article.dto';

@Injectable()
export class NewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    private readonly config: ConfigService,
  ) {}

  async getPublicNews(
    query: PublicNewsQueryDto,
  ) {
    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const where =
      this.buildPublicWhere(query);

    const [
      articles,
      total,
    ] = await Promise.all([
      this.prisma.news_articles.findMany({
        where,
        orderBy: [
          {
            published_at: 'desc',
          },
          {
            created_at: 'desc',
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
      items: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    };
  }

  async getLatestPublicNews() {
    const articles =
      await this.prisma.news_articles.findMany({
        where: {
          status: 'PUBLISHED',
          published_at: {
            not: null,
            lte: new Date(),
          },
          deleted_at: null,
        },
        orderBy: [
          {
            published_at: 'desc',
          },
          {
            created_at: 'desc',
          },
        ],
        take: 5,
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
          status: 'PUBLISHED',
          published_at: {
            not: null,
            lte: new Date(),
          },
          deleted_at: null,
        },
      });

    if (!article) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

    return this.formatArticle(
      article,
    );
  }

  async getAdminNews(
    query: AdminNewsQueryDto,
    user: AuthUser,
  ) {
    this.ensureFlascamAdmin(user);

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const where: Prisma.news_articlesWhereInput = {
      deleted_at: null,

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
                  mode: 'insensitive',
                },
              },
              {
                excerpt: {
                  contains:
                    query.search.trim(),
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [
      articles,
      total,
    ] = await Promise.all([
      this.prisma.news_articles.findMany({
        where,
        orderBy: [
          {
            updated_at: 'desc',
          },
          {
            created_at: 'desc',
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
      items: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages:
          Math.ceil(total / limit),
      },
    };
  }

  async getAdminNewsById(
    id: string,
    user: AuthUser,
  ) {
    this.ensureFlascamAdmin(user);

    const article =
      await this.prisma.news_articles.findFirst({
        where: {
          id,
          deleted_at: null,
        },
      });

    if (!article) {
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
    this.ensureFlascamAdmin(user);

    await this.validatePayload(
      dto,
      null,
    );

    const article =
      await this.prisma.$transaction(
        async (tx) => {
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

                status: 'DRAFT',

                title:
                  dto.title.trim(),

                slug:
                  dto.slug.trim(),

                excerpt:
                  dto.excerpt?.trim(),

                body:
                  dto.body?.trim(),

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
                    ? dto.eventLocation?.trim()
                    : null,

                seo_title:
                  dto.seoTitle?.trim(),

                seo_description:
                  dto.seoDescription?.trim(),

                created_by_user_id:
                  user.id,

                updated_by_user_id:
                  user.id,
              },
            });

          await this.replaceMedia(
            tx,
            created.id,
            dto.media ?? [],
          );

          return created;
        },
      );

    await this.auditLogs.log({
      userId: user.id,
      action:
        'NEWS_ARTICLE_CREATED',
      entityType:
        'NEWS_ARTICLE',
      entityId: article.id,
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
    this.ensureFlascamAdmin(user);

    const existing =
      await this.prisma.news_articles.findFirst({
        where: {
          id,
          deleted_at: null,
        },
      });

    if (!existing) {
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
        async (tx) => {
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
                  dto.excerpt?.trim(),

                body:
                  dto.body?.trim(),

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
                    ? dto.eventLocation?.trim()
                    : null,

                seo_title:
                  dto.seoTitle?.trim(),

                seo_description:
                  dto.seoDescription?.trim(),

                updated_by_user_id:
                  user.id,

                updated_at:
                  new Date(),
              },
            });

          await this.replaceMedia(
            tx,
            id,
            dto.media ?? [],
          );

          return updated;
        },
      );

    await this.auditLogs.log({
      userId: user.id,
      action:
        'NEWS_ARTICLE_UPDATED',
      entityType:
        'NEWS_ARTICLE',
      entityId: article.id,
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
    this.ensureFlascamAdmin(user);

    const existing =
      await this.prisma.news_articles.findFirst({
        where: {
          id,
          deleted_at: null,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

    if (
      dto.status === 'PUBLISHED'
    ) {
      await this.ensureArticleCanBePublished(
        id,
        existing,
      );
    }

    const article =
      await this.prisma.news_articles.update({
        where: {
          id,
        },
        data: {
          status:
            dto.status,

          published_at:
            dto.status ===
            'PUBLISHED'
              ? (
                  existing.published_at ??
                  new Date()
                )
              : null,

          updated_by_user_id:
            user.id,

          updated_at:
            new Date(),
        },
      });

    await this.auditLogs.log({
      userId: user.id,
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

  async deleteNews(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(user);

    const existing =
      await this.prisma.news_articles.findFirst({
        where: {
          id,
          deleted_at: null,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Actualité introuvable.',
      );
    }

    await this.prisma.news_articles.update({
      where: {
        id,
      },
      data: {
        status: 'ARCHIVED',
        published_at: null,
        deleted_at:
          new Date(),
        updated_by_user_id:
          user.id,
        updated_at:
          new Date(),
      },
    });

    await this.auditLogs.log({
      userId: user.id,
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
      success: true,
    };
  }

  private buildPublicWhere(
    query: PublicNewsQueryDto,
  ): Prisma.news_articlesWhereInput {
    const now = new Date();

    const where: Prisma.news_articlesWhereInput = {
      status: 'PUBLISHED',

      published_at: {
        not: null,
        lte: now,
      },

      deleted_at: null,

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
    };

    if (
      query.eventPeriod ===
      'UPCOMING'
    ) {
      where.content_type =
        'EVENT';

      where.event_start_at = {
        gt: now,
      };
    }

    if (
      query.eventPeriod ===
      'ONGOING'
    ) {
      where.content_type =
        'EVENT';

      where.event_start_at = {
        lte: now,
      };

      where.OR = [
        {
          event_end_at: {
            gte: now,
          },
        },
        {
          event_end_at: null,
        },
      ];
    }

    if (
      query.eventPeriod ===
      'PAST'
    ) {
      where.content_type =
        'EVENT';

      where.OR = [
        {
          event_end_at: {
            lt: now,
          },
        },
        {
          event_end_at: null,
          event_start_at: {
            lt: now,
          },
        },
      ];
    }

    return where;
  }

  private async validatePayload(
    dto: UpsertNewsArticleDto,
    articleId: string | null,
  ) {
    const title =
      dto.title.trim();

    const slug =
      dto.slug.trim();

    if (!title) {
      throw new BadRequestException(
        'Le titre est obligatoire.',
      );
    }

    if (!slug) {
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
          deleted_at: null,

          ...(articleId
            ? {
                NOT: {
                  id: articleId,
                },
              }
            : {}),
        },

        select: {
          id: true,
        },
      });

    if (slugOwner) {
      throw new ConflictException(
        'Une autre actualité utilise déjà ce slug.',
      );
    }

    await this.validateMedia(
      dto.media ?? [],
    );
  }

  private async validateMedia(
    media:
      UpsertNewsArticleDto['media'],
  ) {
    const items =
      media ?? [];

    if (!items.length) {
      return;
    }

    const assetIds =
      items.map(
        (item) =>
          item.mediaAssetId,
      );

    const uniqueAssetIds =
      new Set(assetIds);

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
        (item) =>
          item.displayOrder,
      );

    const uniqueOrders =
      new Set(orders);

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
            in: assetIds,
          },

          deleted_at: null,

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
          id: true,
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

  private async ensureArticleCanBePublished(
    articleId: string,
    article: {
      title: string;
      excerpt: string | null;
      body: string | null;
      seo_title: string | null;
      seo_description: string | null;
      content_type: string;
      event_start_at: Date | null;
    },
  ) {
    if (!article.title.trim()) {
      throw new BadRequestException(
        'Le titre est obligatoire avant publication.',
      );
    }

    if (!article.excerpt?.trim()) {
      throw new BadRequestException(
        'Le résumé est obligatoire avant publication.',
      );
    }

    if (!article.body?.trim()) {
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

    const mediaCount =
      await this.prisma.news_article_media.count({
        where: {
          news_article_id:
            articleId,
        },
      });

    if (mediaCount < 1) {
      throw new BadRequestException(
        'Au moins une photo ou une vidéo est obligatoire avant publication.',
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

    if (!media.length) {
      return;
    }

    await tx.news_article_media.createMany({
      data:
        media.map(
          (item) => ({
            news_article_id:
              articleId,

            media_asset_id:
              item.mediaAssetId,

            display_order:
              item.displayOrder,

            alt_text:
              item.altText?.trim(),

            caption:
              item.caption?.trim(),

            updated_at:
              new Date(),
          }),
        ),
    });
  }

  private async formatArticles(
    articles: Array<{
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
      created_at: Date;
      updated_at: Date;
    }>,
  ) {
    if (!articles.length) {
      return [];
    }

    const articleIds =
      articles.map(
        (article) =>
          article.id,
      );

    const media =
      await this.prisma.news_article_media.findMany({
        where: {
          news_article_id: {
            in: articleIds,
          },
        },

        include: {
          media_assets: true,
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

    const mediaByArticle =
      new Map<string, any[]>();

    for (
      const item of media
    ) {
      const current =
        mediaByArticle.get(
          item.news_article_id,
        ) ?? [];

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

    return articles.map(
      (article) =>
        this.formatArticleData(
          article,
          mediaByArticle.get(
            article.id,
          ) ?? [],
        ),
    );
  }

  private async formatArticle(
    article: {
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
      created_at: Date;
      updated_at: Date;
    },
  ) {
    const media =
      await this.prisma.news_article_media.findMany({
        where: {
          news_article_id:
            article.id,
        },

        include: {
          media_assets: true,
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

    return this.formatArticleData(
      article,
      media.map(
        (item) =>
          this.formatMedia(
            item,
          ),
      ),
    );
  }

  private formatArticleData(
    article: {
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
      created_at: Date;
      updated_at: Date;
    },
    media: any[],
  ) {
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

      createdAt:
        article.created_at,

      updatedAt:
        article.updated_at,

      media,

      primaryMedia:
        media[0] ?? null,
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

    if (!baseUrl) {
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