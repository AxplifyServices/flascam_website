import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import type { Request } from 'express';

import { AuditLogsService } from '../audit-logs/audit-logs.service';

import type { AuthUser } from '../auth/types/auth-user.type';

import { PrismaService } from '../prisma/prisma.service';

import { UpdateAssociationPostStatusDto } from './dto/update-association-post-status.dto';

import { UpdateAssociationStatusDto } from './dto/update-association-status.dto';

import { UpdateOwnAssociationDto } from './dto/update-own-association.dto';

import { UpsertAssociationDto } from './dto/upsert-association.dto';

import { UpsertAssociationMediaDto } from './dto/upsert-association-media.dto';

import { UpsertAssociationPostDto } from './dto/upsert-association-post.dto';

import * as bcrypt from 'bcrypt';

@Injectable()
export class AssociationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogs: AuditLogsService,
    private readonly config: ConfigService,
  ) {}

  async getPublicAssociations() {
    const associations = await this.prisma.regional_associations.findMany({
      where: {
        status: 'PUBLISHED',
        deleted_at: null,
      },
      orderBy: [
        {
          is_featured: 'desc',
        },
        {
          display_order: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      include: {
        media_assets: true,
      },
    });

    return associations.map((association) =>
      this.formatAssociationSummary(association),
    );
  }

  async getFeaturedAssociations() {
    const associations = await this.prisma.regional_associations.findMany({
      where: {
        status: 'PUBLISHED',
        deleted_at: null,
        is_featured: true,
      },
      orderBy: [
        {
          display_order: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      take: 6,
      include: {
        media_assets: true,
      },
    });

    return associations.map((association) =>
      this.formatAssociationSummary(association),
    );
  }

  async getPublicAssociationBySlug(slug: string) {
    const association = await this.prisma.regional_associations.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deleted_at: null,
      },
      include: {
        media_assets: true,
      },
    });

    if (!association) {
      throw new NotFoundException('Association introuvable.');
    }

const now =
  new Date();

const [
  actualities,
  events,
  photos,
  videos,
] =
  await Promise.all([
    this.prisma.news_articles.findMany({
      where: {
        regional_association_id:
          association.id,

        content_type: {
          not:
            'EVENT',
        },

        status:
          'PUBLISHED',

        published_at: {
          lte:
            now,
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
        12,

      include: {
        news_article_media: {
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
        },
      },
    }),

    this.prisma.news_articles.findMany({
      where: {
        regional_association_id:
          association.id,

        content_type:
          'EVENT',

        status:
          'PUBLISHED',

        published_at: {
          lte:
            now,
        },

        event_start_at: {
          gte:
            now,
        },

        deleted_at:
          null,
      },

      orderBy: [
        {
          event_start_at:
            'asc',
        },
        {
          published_at:
            'desc',
        },
      ],

      take:
        5,

      include: {
        news_article_media: {
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
        },
      },
    }),

    this.prisma.association_media_items.findMany({
      where: {
        regional_association_id:
          association.id,

        media_type:
          'PHOTO',

        is_published:
          true,

        deleted_at:
          null,
      },

      orderBy: {
        display_order:
          'asc',
      },

      take:
        12,

      include: {
        media_assets:
          true,
      },
    }),

    this.prisma.association_media_items.findMany({
      where: {
        regional_association_id:
          association.id,

        media_type:
          'VIDEO',

        is_published:
          true,

        deleted_at:
          null,
      },

      orderBy: {
        display_order:
          'asc',
      },

      take:
        6,

      include: {
        media_assets:
          true,
      },
    }),
  ]);

return {
  ...this.formatAssociationDetail(
    association,
  ),

  actualities:
    actualities.map(
      (
        article,
      ) =>
        this.formatAssociationNewsArticle(
          article,
        ),
    ),

  events:
    events.map(
      (
        article,
      ) =>
        this.formatAssociationNewsArticle(
          article,
        ),
    ),

  photos:
    photos.map(
      (
        media,
      ) =>
        this.formatMediaItem(
          media,
        ),
    ),

  videos:
    videos.map(
      (
        media,
      ) =>
        this.formatMediaItem(
          media,
        ),
    ),
};
  }

  async getAdminAssociations(user: AuthUser) {
    const scope = await this.getAssociationScope(user);

    const associations = await this.prisma.regional_associations.findMany({
      where: {
        deleted_at: null,
        ...(scope.associationId
          ? {
              id: scope.associationId,
            }
          : {}),
      },
      orderBy: [
        {
          display_order: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      include: {
        media_assets: true,
      },
    });

    return associations.map((association) =>
      this.formatAssociationSummary(association),
    );
  }

  async getAdminAssociation(id: string, user: AuthUser) {
    await this.ensureAssociationAccess(id, user);

    const association = await this.prisma.regional_associations.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        media_assets: true,
      },
    });

    if (!association) {
      throw new NotFoundException('Association introuvable.');
    }

    const [posts, mediaItems] = await Promise.all([
      this.prisma.association_posts.findMany({
        where: {
          regional_association_id: id,
          deleted_at: null,
        },
        orderBy: [
          {
            content_type: 'asc',
          },
          {
            display_order: 'asc',
          },
          {
            created_at: 'desc',
          },
        ],
        include: {
          media_assets: true,
        },
      }),

      this.prisma.association_media_items.findMany({
        where: {
          regional_association_id: id,
          deleted_at: null,
        },
        orderBy: [
          {
            media_type: 'asc',
          },
          {
            display_order: 'asc',
          },
        ],
        include: {
          media_assets: true,
        },
      }),
    ]);

    const adminAccount = await this.getAssociationAdminAccount(id);

    return {
      ...this.formatAssociationDetail(association),
      adminAccount,
      posts: posts.map((post) => this.formatPost(post)),
      mediaItems: mediaItems.map((media) => this.formatMediaItem(media)),
    };
  }

  async getOwnAssociation(user: AuthUser) {
    const associationId = await this.getOwnAssociationId(user);

    const association = await this.getAdminAssociation(associationId, user);

    const { adminAccount: _adminAccount, ...safeAssociation } = association;

    return safeAssociation;
  }

  async updateOwnAssociation(
    dto: UpdateOwnAssociationDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId = await this.getOwnAssociationId(user);

    const association = await this.prisma.regional_associations.update({
      where: {
        id: associationId,
      },
      data: {
        name: dto.name,
        acronym: dto.acronym,
        region: dto.region,
        city: dto.city,
        member_count: dto.memberCount,
        logo_media_asset_id: dto.logoMediaAssetId,
        cover_image_url: dto.coverImageUrl,
        logo_text: dto.logoText,
        presentation: dto.presentation,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        website_url: dto.websiteUrl,
        facebook_url: dto.facebookUrl,
        instagram_url: dto.instagramUrl,
        linkedin_url: dto.linkedinUrl,
        youtube_url: dto.youtubeUrl,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        updated_at: new Date(),
      },
    });

    await this.auditLogs.log({
      userId: user.id,
      action: 'ASSOCIATION_PROFILE_UPDATED',
      entityType: 'REGIONAL_ASSOCIATION',
      entityId: association.id,
      description: `Mise à jour de la fiche de l’association ${association.name}.`,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    });

    return this.getOwnAssociation(user);
  }

  async createOwnPost(
    dto: UpsertAssociationPostDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId = await this.getOwnAssociationId(user);

    return this.upsertPost(associationId, null, dto, user, request);
  }

  async updateOwnPost(
    postId: string,
    dto: UpsertAssociationPostDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId = await this.getOwnAssociationId(user);

    return this.upsertPost(associationId, postId, dto, user, request);
  }

  async createOwnMediaItem(
    dto: UpsertAssociationMediaDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId = await this.getOwnAssociationId(user);

    return this.upsertMediaItem(associationId, null, dto, user, request);
  }

  async updateOwnMediaItem(
    mediaItemId: string,
    dto: UpsertAssociationMediaDto,
    user: AuthUser,
    request: Request,
  ) {
    const associationId = await this.getOwnAssociationId(user);

    return this.upsertMediaItem(associationId, mediaItemId, dto, user, request);
  }

  async createAssociation(
    dto: UpsertAssociationDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(user);

    const existingAssociation =
      await this.prisma.regional_associations.findFirst({
        where: {
          slug: dto.slug,
          deleted_at: null,
        },
        select: {
          id: true,
        },
      });

    if (existingAssociation) {
      throw new ConflictException('Une association utilise déjà ce slug.');
    }

    const association = await this.prisma.regional_associations.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        acronym: dto.acronym,
        region: dto.region,
        city: dto.city,
        member_count: dto.memberCount,
        affiliated_since_year: dto.affiliatedSinceYear,
        logo_media_asset_id: dto.logoMediaAssetId,
        cover_image_url: dto.coverImageUrl,
        logo_text: dto.logoText,
        presentation: dto.presentation,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        website_url: dto.websiteUrl,
        facebook_url: dto.facebookUrl,
        instagram_url: dto.instagramUrl,
        linkedin_url: dto.linkedinUrl,
        youtube_url: dto.youtubeUrl,
        is_featured: dto.isFeatured ?? false,
        display_order: dto.displayOrder ?? 0,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
      },
    });

    if (
      dto.adminEmail ||
      dto.adminPassword ||
      dto.adminFirstName ||
      dto.adminLastName
    ) {
      await this.upsertAssociationAdminAccount(association.id, dto, user);
    }

    await this.auditLogs.log({
      userId: user.id,
      action: 'ASSOCIATION_CREATED',
      entityType: 'REGIONAL_ASSOCIATION',
      entityId: association.id,
      description: `Création de l’association ${association.name}.`,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    });

    return this.getAdminAssociation(association.id, user);
  }

  async updateAssociation(
    id: string,
    dto: UpsertAssociationDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(user);

    await this.ensureAssociationAccess(id, user);

    const slugOwner = await this.prisma.regional_associations.findFirst({
      where: {
        slug: dto.slug,
        deleted_at: null,
        NOT: {
          id,
        },
      },
      select: {
        id: true,
      },
    });

    if (slugOwner) {
      throw new ConflictException(
        'Une autre association utilise déjà ce slug.',
      );
    }

    const association = await this.prisma.regional_associations.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        slug: dto.slug,
        acronym: dto.acronym,
        region: dto.region,
        city: dto.city,
        member_count: dto.memberCount,
        affiliated_since_year: dto.affiliatedSinceYear,
        logo_media_asset_id: dto.logoMediaAssetId,
        cover_image_url: dto.coverImageUrl,
        logo_text: dto.logoText,
        presentation: dto.presentation,
        address: dto.address,
        phone: dto.phone,
        email: dto.email,
        website_url: dto.websiteUrl,
        facebook_url: dto.facebookUrl,
        instagram_url: dto.instagramUrl,
        linkedin_url: dto.linkedinUrl,
        youtube_url: dto.youtubeUrl,
        is_featured: dto.isFeatured ?? false,
        display_order: dto.displayOrder ?? 0,
        seo_title: dto.seoTitle,
        seo_description: dto.seoDescription,
        updated_at: new Date(),
      },
    });

    if (
      dto.adminEmail ||
      dto.adminPassword ||
      dto.adminFirstName ||
      dto.adminLastName
    ) {
      await this.upsertAssociationAdminAccount(association.id, dto, user);
    }

    await this.auditLogs.log({
      userId: user.id,
      action: 'ASSOCIATION_UPDATED',
      entityType: 'REGIONAL_ASSOCIATION',
      entityId: association.id,
      description: `Mise à jour de l’association ${association.name}.`,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    });

    return this.getAdminAssociation(association.id, user);
  }

  async updateAssociationStatus(
    id: string,
    dto: UpdateAssociationStatusDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(user);

    await this.ensureAssociationAccess(id, user);

    const association = await this.prisma.regional_associations.update({
      where: {
        id,
      },
      data: {
        status: dto.status,
        published_at: dto.status === 'PUBLISHED' ? new Date() : null,
        updated_at: new Date(),
      },
    });

    await this.auditLogs.log({
      userId: user.id,
      action: 'ASSOCIATION_STATUS_UPDATED',
      entityType: 'REGIONAL_ASSOCIATION',
      entityId: association.id,
      description: `Statut association modifié : ${dto.status}.`,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    });

    return {
      id: association.id,
      status: association.status,
      publishedAt: association.published_at,
    };
  }

  async upsertPost(
    associationId: string,
    postId: string | null,
    dto: UpsertAssociationPostDto,
    user: AuthUser,
    request: Request,
  ) {
    await this.ensureAssociationAccess(associationId, user);

    if (dto.contentType === 'EVENT' && !dto.eventStartAt) {
      throw new BadRequestException(
        'La date de début est obligatoire pour un événement.',
      );
    }

    if (
      dto.eventStartAt &&
      dto.eventEndAt &&
      new Date(dto.eventEndAt) < new Date(dto.eventStartAt)
    ) {
      throw new BadRequestException(
        'La date de fin doit être postérieure à la date de début.',
      );
    }

    const existingPost = postId
      ? await this.prisma.association_posts.findFirst({
          where: {
            id: postId,
            regional_association_id: associationId,
            deleted_at: null,
          },
        })
      : null;

    if (postId && !existingPost) {
      throw new NotFoundException('Contenu association introuvable.');
    }

    const slugOwner = await this.prisma.association_posts.findFirst({
      where: {
        regional_association_id: associationId,
        slug: dto.slug,
        deleted_at: null,
        ...(postId
          ? {
              NOT: {
                id: postId,
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
        'Une actualité ou un événement utilise déjà ce slug.',
      );
    }

    const isAssociationUser = user.role === 'ASSOCIATION_ADMIN';

    const status = isAssociationUser
      ? 'PUBLISHED'
      : (existingPost?.status ?? 'DRAFT');

    const publishedAt =
      status === 'PUBLISHED'
        ? (existingPost?.published_at ?? new Date())
        : null;

    const data = {
      regional_association_id: associationId,
      content_type: dto.contentType,
      title: dto.title,
      slug: dto.slug,
      excerpt: dto.excerpt,
      body: dto.body,
      cover_media_asset_id: dto.coverMediaAssetId,
      event_start_at:
        dto.contentType === 'EVENT' && dto.eventStartAt
          ? new Date(dto.eventStartAt)
          : null,
      event_end_at:
        dto.contentType === 'EVENT' && dto.eventEndAt
          ? new Date(dto.eventEndAt)
          : null,
      event_location: dto.contentType === 'EVENT' ? dto.eventLocation : null,
      display_order: dto.displayOrder ?? 0,
      seo_title: dto.seoTitle,
      seo_description: dto.seoDescription,
      status,
      published_at: publishedAt,
      updated_at: new Date(),
    };

    const post = existingPost
      ? await this.prisma.association_posts.update({
          where: {
            id: existingPost.id,
          },
          data,
        })
      : await this.prisma.association_posts.create({
          data,
        });

    await this.auditLogs.log({
      userId: user.id,
      action: existingPost
        ? 'ASSOCIATION_POST_UPDATED'
        : 'ASSOCIATION_POST_CREATED',
      entityType: 'ASSOCIATION_POST',
      entityId: post.id,
      description: existingPost
        ? `Contenu association modifié : ${post.title}.`
        : `Contenu association créé : ${post.title}.`,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    });

    return isAssociationUser
      ? this.getOwnAssociation(user)
      : this.getAdminAssociation(associationId, user);
  }

  async updatePostStatus(
    associationId: string,
    postId: string,
    dto: UpdateAssociationPostStatusDto,
    user: AuthUser,
    request: Request,
  ) {
    this.ensureFlascamAdmin(user);

    await this.ensureAssociationAccess(associationId, user);

    const existingPost = await this.prisma.association_posts.findFirst({
      where: {
        id: postId,
        regional_association_id: associationId,
        deleted_at: null,
      },
      select: {
        id: true,
        published_at: true,
      },
    });

    if (!existingPost) {
      throw new NotFoundException('Contenu association introuvable.');
    }

    const post = await this.prisma.association_posts.update({
      where: {
        id: postId,
      },
      data: {
        status: dto.status,
        published_at:
          dto.status === 'PUBLISHED'
            ? (existingPost.published_at ?? new Date())
            : null,
        updated_at: new Date(),
      },
    });

    await this.auditLogs.log({
      userId: user.id,
      action: 'ASSOCIATION_POST_STATUS_UPDATED',
      entityType: 'ASSOCIATION_POST',
      entityId: post.id,
      description: `Statut contenu association modifié : ${dto.status}.`,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    });

    return this.getAdminAssociation(associationId, user);
  }

  async upsertMediaItem(
    associationId: string,
    mediaItemId: string | null,
    dto: UpsertAssociationMediaDto,
    user: AuthUser,
    request: Request,
  ) {
    await this.ensureAssociationAccess(associationId, user);

    const existingMediaItem = mediaItemId
      ? await this.prisma.association_media_items.findFirst({
          where: {
            id: mediaItemId,
            regional_association_id: associationId,
            deleted_at: null,
          },
          select: {
            id: true,
          },
        })
      : null;

    if (mediaItemId && !existingMediaItem) {
      throw new NotFoundException('Média association introuvable.');
    }

    const mediaAsset = await this.prisma.media_assets.findFirst({
      where: {
        id: dto.mediaAssetId,
        deleted_at: null,
        status: 'READY',
      },
      select: {
        id: true,
        media_type: true,
      },
    });

    if (!mediaAsset) {
      throw new NotFoundException('Fichier média introuvable ou indisponible.');
    }

    const isAssociationUser = user.role === 'ASSOCIATION_ADMIN';

    const data = {
      regional_association_id: associationId,
      media_asset_id: dto.mediaAssetId,
      media_type: dto.mediaType,
      title: dto.title,
      caption: dto.caption,
      display_order: dto.displayOrder ?? 0,
      is_published: isAssociationUser ? true : (dto.isPublished ?? true),
      updated_at: new Date(),
    };

    const mediaItem = existingMediaItem
      ? await this.prisma.association_media_items.update({
          where: {
            id: existingMediaItem.id,
          },
          data,
        })
      : await this.prisma.association_media_items.create({
          data,
        });

    await this.auditLogs.log({
      userId: user.id,
      action: existingMediaItem
        ? 'ASSOCIATION_MEDIA_UPDATED'
        : 'ASSOCIATION_MEDIA_CREATED',
      entityType: 'ASSOCIATION_MEDIA',
      entityId: mediaItem.id,
      description: existingMediaItem
        ? 'Média association modifié.'
        : 'Média association ajouté.',
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    });

    return isAssociationUser
      ? this.getOwnAssociation(user)
      : this.getAdminAssociation(associationId, user);
  }

  private async getOwnAssociationId(user: AuthUser) {
    if (user.role !== 'ASSOCIATION_ADMIN') {
      throw new ForbiddenException(
        'Cette action est réservée à une association connectée.',
      );
    }

    const account = await this.prisma.users.findFirst({
      where: {
        id: user.id,
        deleted_at: null,
        is_active: true,
      },
      select: {
        regional_association_id: true,
      },
    });

    if (!account?.regional_association_id) {
      throw new ForbiddenException(
        'Aucune association n’est liée à ce compte.',
      );
    }

    const association = await this.prisma.regional_associations.findFirst({
      where: {
        id: account.regional_association_id,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    if (!association) {
      throw new NotFoundException('Association liée au compte introuvable.');
    }

    return association.id;
  }

  private async getAssociationAdminAccount(associationId: string) {
    const role = await this.prisma.roles.findUnique({
      where: {
        code: 'ASSOCIATION_ADMIN',
      },
      select: {
        id: true,
      },
    });

    if (!role) {
      return null;
    }

    const account = await this.prisma.users.findFirst({
      where: {
        regional_association_id: associationId,
        role_id: role.id,
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        last_login_at: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    if (!account) {
      return null;
    }

    return {
      id: account.id,
      email: account.email,
      firstName: account.first_name,
      lastName: account.last_name,
      isActive: account.is_active,
      lastLoginAt: account.last_login_at,
    };
  }

  private async upsertAssociationAdminAccount(
    associationId: string,
    dto: UpsertAssociationDto,
    user: AuthUser,
  ) {
    this.ensureFlascamAdmin(user);

    const role = await this.prisma.roles.findUnique({
      where: {
        code: 'ASSOCIATION_ADMIN',
      },
      select: {
        id: true,
      },
    });

    if (!role) {
      throw new BadRequestException(
        'Le rôle ASSOCIATION_ADMIN est introuvable.',
      );
    }

    const existingAccount = await this.prisma.users.findFirst({
      where: {
        regional_association_id: associationId,
        role_id: role.id,
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
      },
    });

    const requestedEmail =
      dto.adminEmail?.trim().toLowerCase() || existingAccount?.email;

    if (!requestedEmail) {
      throw new BadRequestException(
        'L’e-mail du compte association est obligatoire.',
      );
    }

    const emailOwner = await this.prisma.users.findFirst({
      where: {
        email: requestedEmail,
        deleted_at: null,
      },
      select: {
        id: true,
        regional_association_id: true,
      },
    });

    if (emailOwner && emailOwner.id !== existingAccount?.id) {
      throw new ConflictException(
        'Cet e-mail est déjà utilisé par un autre compte.',
      );
    }

    const passwordData = dto.adminPassword
      ? {
          password_hash: await bcrypt.hash(dto.adminPassword, 12),
          password_changed_at: new Date(),
        }
      : {};

    if (!existingAccount && !dto.adminPassword) {
      throw new BadRequestException(
        'Le mot de passe est obligatoire pour créer le compte association.',
      );
    }

    if (existingAccount) {
      await this.prisma.users.update({
        where: {
          id: existingAccount.id,
        },
        data: {
          email: requestedEmail,
          first_name: dto.adminFirstName ?? 'Admin',
          last_name: dto.adminLastName ?? 'Association',
          role_id: role.id,
          regional_association_id: associationId,
          is_active: true,
          is_email_verified: true,
          deleted_at: null,
          updated_at: new Date(),
          ...passwordData,
        },
      });

      await this.auditLogs.log({
        userId: user.id,
        action: 'ASSOCIATION_ADMIN_ACCOUNT_UPDATED',
        entityType: 'USER',
        entityId: existingAccount.id,
        description: 'Modification du compte administrateur association.',
      });

      return;
    }

    const createdUser = await this.prisma.users.create({
      data: {
        role_id: role.id,
        regional_association_id: associationId,
        email: requestedEmail,
        password_hash: passwordData.password_hash!,
        first_name: dto.adminFirstName ?? 'Admin',
        last_name: dto.adminLastName ?? 'Association',
        is_active: true,
        is_email_verified: true,
        password_changed_at: new Date(),
      },
      select: {
        id: true,
      },
    });

    await this.auditLogs.log({
      userId: user.id,
      action: 'ASSOCIATION_ADMIN_ACCOUNT_CREATED',
      entityType: 'USER',
      entityId: createdUser.id,
      description: 'Création du compte administrateur association.',
    });
  }

  private async getAssociationScope(user: AuthUser) {
    if (user.role === 'SUPER_ADMIN' || user.role === 'FLASCAM_ADMIN') {
      return {
        associationId: null as string | null,
      };
    }

    const account = await this.prisma.users.findUnique({
      where: {
        id: user.id,
      },
      select: {
        regional_association_id: true,
      },
    });

    if (user.role === 'ASSOCIATION_ADMIN' && account?.regional_association_id) {
      return {
        associationId: account.regional_association_id,
      };
    }

    throw new ForbiddenException('Accès association refusé.');
  }

  private async ensureAssociationAccess(associationId: string, user: AuthUser) {
    const scope = await this.getAssociationScope(user);

    if (scope.associationId && scope.associationId !== associationId) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que votre association.',
      );
    }

    const exists = await this.prisma.regional_associations.findFirst({
      where: {
        id: associationId,
        deleted_at: null,
      },
      select: {
        id: true,
      },
    });

    if (!exists) {
      throw new NotFoundException('Association introuvable.');
    }
  }

  private ensureFlascamAdmin(user: AuthUser) {
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'FLASCAM_ADMIN') {
      throw new ForbiddenException(
        'Action réservée à l’administration FLASCAM.',
      );
    }
  }

  private mediaUrl(
    asset:
      | {
          object_key: string;
        }
      | null
      | undefined,
  ) {
    if (!asset) {
      return null;
    }

    const baseUrl = this.config.get<string>('PUBLIC_MEDIA_BASE_URL', '');

    if (!baseUrl) {
      return asset.object_key;
    }

    return `${baseUrl.replace(/\/$/, '')}/${asset.object_key.replace(/^\//, '')}`;
  }

  private formatAssociationSummary(association: any) {
    return {
      id: association.id,
      name: association.name,
      slug: association.slug,
      acronym: association.acronym,
      region: association.region,
      city: association.city,
      memberCount: association.member_count,
      affiliatedSinceYear: association.affiliated_since_year,
      logoText: association.logo_text,
      logoUrl: this.mediaUrl(association.media_assets),
      coverImageUrl: association.cover_image_url,
      status: association.status,
      isFeatured: association.is_featured,
      displayOrder: association.display_order,
      seoTitle: association.seo_title,
      seoDescription: association.seo_description,
    };
  }

  private formatAssociationDetail(association: any) {
    return {
      ...this.formatAssociationSummary(association),
      logoMediaAssetId: association.logo_media_asset_id,
      presentation: association.presentation,
      address: association.address,
      phone: association.phone,
      email: association.email,
      websiteUrl: association.website_url,
      facebookUrl: association.facebook_url,
      instagramUrl: association.instagram_url,
      linkedinUrl: association.linkedin_url,
      youtubeUrl: association.youtube_url,
      publishedAt: association.published_at,
      createdAt: association.created_at,
      updatedAt: association.updated_at,
    };
  }

private formatAssociationNewsArticle(
  article: any,
) {
  const primaryMedia =
    article.news_article_media?.[0] ??
    null;

  return {
    id:
      article.id,

    associationId:
      article.regional_association_id,

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

    coverUrl:
      this.mediaUrl(
        primaryMedia?.media_assets,
      ),

    coverAltText:
      primaryMedia?.alt_text ??
      primaryMedia?.media_assets?.alt_text ??
      article.title,

    eventStartAt:
      article.event_start_at,

    eventEndAt:
      article.event_end_at,

    eventLocation:
      article.event_location,

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
  };
}  

  private formatPost(post: any) {
    return {
      id: post.id,
      associationId: post.regional_association_id,
      contentType: post.content_type,
      status: post.status,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      body: post.body,
      coverUrl: this.mediaUrl(post.media_assets),
      eventStartAt: post.event_start_at,
      eventEndAt: post.event_end_at,
      eventLocation: post.event_location,
      displayOrder: post.display_order,
      seoTitle: post.seo_title,
      seoDescription: post.seo_description,
      publishedAt: post.published_at,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    };
  }

  private formatMediaItem(media: any) {
    return {
      id: media.id,
      associationId: media.regional_association_id,
      mediaType: media.media_type,
      mediaAssetId: media.media_asset_id,
      title: media.title,
      caption: media.caption,
      displayOrder: media.display_order,
      isPublished: media.is_published,
      url: this.mediaUrl(media.media_assets),
      createdAt: media.created_at,
      updatedAt: media.updated_at,
    };
  }
}
