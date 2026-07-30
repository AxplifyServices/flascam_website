import {
  BadRequestException,
  ForbiddenException,
  Injectable,
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
  MyMarketplaceListingsQueryDto,
} from './dto/my-marketplace-listings-query.dto';

import {
  PublicMarketplaceListingsQueryDto,
} from './dto/public-marketplace-listings-query.dto';

import {
  MarketplaceListingMediaInputDto,
} from './dto/marketplace-listing-media-input.dto';

import {
  UpsertMarketplaceListingDto,
} from './dto/upsert-marketplace-listing.dto';

import {
  AdminMarketplaceListingsQueryDto,
} from './dto/admin-marketplace-listings-query.dto';

import {
  MARKETPLACE_MAX_IMAGES,
  MARKETPLACE_MAX_VIDEOS,
} from './marketplace.constants';

type SellerScope = {
  sellerType:
    | 'FLASCAM'
    | 'ASSOCIATION'
    | 'ADHERENT';

  regionalAssociationId:
    | string
    | null;

  adherentId:
    | string
    | null;
};

type MarketplaceTransaction =
  Prisma.TransactionClient;

@Injectable()
export class MarketplaceService {
  constructor(
    private readonly prisma:
      PrismaService,

    private readonly auditLogs:
      AuditLogsService,

    private readonly config:
      ConfigService,
  ) {}

  /*
   * ==========================================================
   * ROUTES PUBLIQUES
   * ==========================================================
   */

  async getPublicListings(
    query:
      PublicMarketplaceListingsQueryDto,
  ) {
    await this.expireOutdatedListings();

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

    const orderBy =
      this.buildPublicOrderBy(
        query.sort,
      );

    const [
      listings,
      total,
    ] =
      await Promise.all([
        this.prisma.marketplace_listings.findMany({
          where,

          include: {
            marketplace_listing_media: {
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

          orderBy,
          skip,
          take:
            limit,
        }),

        this.prisma.marketplace_listings.count({
          where,
        }),
      ]);

    return {
      items:
        listings.map(
          (listing) =>
            this.formatPublicListingCard(
              listing,
            ),
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

  async getPublicListingBySlug(
    slug: string,
  ) {
    await this.expireOutdatedListings();

    const listing =
      await this.prisma.marketplace_listings.findFirst({
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

          expires_at: {
            not:
              null,

            gt:
              new Date(),
          },

          deleted_at:
            null,
        },

        include: {
          marketplace_listing_media: {
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
      });

    if (!listing) {
      throw new NotFoundException(
        'Cette annonce est introuvable ou n’est plus disponible.',
      );
    }

    return this.formatPublicListingDetail(
      listing,
    );
  }

  /*
   * ==========================================================
   * ANNONCES DU PROPRIÉTAIRE CONNECTÉ
   * ==========================================================
   */

  async getMyListings(
    query:
      MyMarketplaceListingsQueryDto,

    user:
      AuthUser,
  ) {
    await this.expireOutdatedListings();

    const page =
      query.page;

    const limit =
      query.limit;

    const skip =
      (page - 1) *
      limit;

    const search =
      query.search?.trim();

    const where:
      Prisma.marketplace_listingsWhereInput =
      {
        owner_user_id:
          user.id,

        deleted_at:
          null,

        ...(query.status
          ? {
              status:
                query.status,
            }
          : {}),

        ...(search
          ? {
              OR: [
                {
                  reference: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },
                {
                  title: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },
                {
                  brand: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },
                {
                  model: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },
              ],
            }
          : {}),
      };

    const [
      listings,
      total,
    ] =
      await Promise.all([
        this.prisma.marketplace_listings.findMany({
          where,

          include: {
            marketplace_listing_media: {
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

            _count: {
              select: {
                marketplace_offers:
                  true,
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

        this.prisma.marketplace_listings.count({
          where,
        }),
      ]);

    return {
      items:
        listings.map(
          (listing) =>
            this.formatPrivateListing(
              listing,
            ),
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

  async getMyListingById(
    id: string,
    user: AuthUser,
  ) {
    await this.expireOutdatedListings();

    const listing =
      await this.prisma.marketplace_listings.findFirst({
        where: {
          id,

          owner_user_id:
            user.id,

          deleted_at:
            null,
        },

        include: {
          marketplace_listing_media: {
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

          _count: {
            select: {
              marketplace_offers:
                true,
            },
          },
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Annonce introuvable.',
      );
    }

    return this.formatPrivateListing(
      listing,
    );
  }

  async createListing(
    dto:
      UpsertMarketplaceListingDto,

    user:
      AuthUser,

    request:
      Request,
  ) {
    const sellerScope =
      await this.resolveSellerScope(
        user,
      );

    this.validateDtoMedia(
      dto.media,
    );

    const normalized =
      this.normalizeListingDto(
        dto,
      );

    const result =
      await this.prisma.$transaction(
        async (
          transaction,
        ) => {
          await this.validateMediaAssets(
            transaction,
            dto.media,
            user,
          );

          const reference =
            await this.generateUniqueReference(
              transaction,
            );

          const slug =
            await this.generateUniqueSlug(
              transaction,
              normalized.brand,
              normalized.model,
              normalized.registrationYear,
              reference,
            );

          const listing =
            await transaction.marketplace_listings.create({
              data: {
                reference,
                slug,

                owner_user_id:
                  user.id,

                seller_type:
                  sellerScope.sellerType,

                regional_association_id:
                  sellerScope.regionalAssociationId,

                adherent_id:
                  sellerScope.adherentId,

                status:
                  'DRAFT',

                title:
                  normalized.title,

                description:
                  normalized.description,

                vehicle_type:
                  normalized.vehicleType,

                brand:
                  normalized.brand,

                model:
                  normalized.model,

                version:
                  normalized.version,

                registration_year:
                  normalized.registrationYear,

                first_registration_date:
                  normalized.firstRegistrationDate,

                mileage_km:
                  normalized.mileageKm,

                fuel_type:
                  normalized.fuelType,

                transmission:
                  normalized.transmission,

                fiscal_power:
                  normalized.fiscalPower,

                engine_power_hp:
                  normalized.enginePowerHp,

                engine_capacity_cc:
                  normalized.engineCapacityCc,

                body_type:
                  normalized.bodyType,

                exterior_color:
                  normalized.exteriorColor,

                interior_color:
                  normalized.interiorColor,

                doors_count:
                  normalized.doorsCount,

                seats_count:
                  normalized.seatsCount,

                registration_city:
                  normalized.registrationCity,

                requested_price:
                  new Prisma.Decimal(
                    normalized.requestedPrice,
                  ),

                currency_code:
                  'MAD',

                duration_days:
                  normalized.durationDays,

                seo_title:
                  normalized.seoTitle,

                seo_description:
                  normalized.seoDescription,
              },
            });

          await this.replaceListingMedia(
            transaction,
            listing.id,
            dto.media,
          );

          return transaction.marketplace_listings.findUnique({
            where: {
              id:
                listing.id,
            },

            include: {
              marketplace_listing_media: {
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

              _count: {
                select: {
                  marketplace_offers:
                    true,
                },
              },
            },
          });
        },
      );

    if (!result) {
      throw new NotFoundException(
        'Impossible de récupérer l’annonce créée.',
      );
    }

    await this.writeAudit(
      request,
      user,
      'MARKETPLACE_LISTING_CREATED',
      result.id,
      `Création du brouillon ${result.reference}.`,
      {
        reference:
          result.reference,

        sellerType:
          result.seller_type,
      },
    );

    return this.formatPrivateListing(
      result,
    );
  }

  async updateListing(
    id: string,

    dto:
      UpsertMarketplaceListingDto,

    user:
      AuthUser,

    request:
      Request,
  ) {
    this.validateDtoMedia(
      dto.media,
    );

    const existing =
      await this.getOwnedListingRecord(
        id,
        user,
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
        'Seules les annonces en brouillon ou refusées peuvent être modifiées.',
      );
    }

    const normalized =
      this.normalizeListingDto(
        dto,
      );

    const updated =
      await this.prisma.$transaction(
        async (
          transaction,
        ) => {
          await this.validateMediaAssets(
            transaction,
            dto.media,
            user,
          );

          await transaction.marketplace_listings.update({
            where: {
              id,
            },

            data: {
              title:
                normalized.title,

              description:
                normalized.description,

              vehicle_type:
                normalized.vehicleType,

              brand:
                normalized.brand,

              model:
                normalized.model,

              version:
                normalized.version,

              registration_year:
                normalized.registrationYear,

              first_registration_date:
                normalized.firstRegistrationDate,

              mileage_km:
                normalized.mileageKm,

              fuel_type:
                normalized.fuelType,

              transmission:
                normalized.transmission,

              fiscal_power:
                normalized.fiscalPower,

              engine_power_hp:
                normalized.enginePowerHp,

              engine_capacity_cc:
                normalized.engineCapacityCc,

              body_type:
                normalized.bodyType,

              exterior_color:
                normalized.exteriorColor,

              interior_color:
                normalized.interiorColor,

              doors_count:
                normalized.doorsCount,

              seats_count:
                normalized.seatsCount,

              registration_city:
                normalized.registrationCity,

              requested_price:
                new Prisma.Decimal(
                  normalized.requestedPrice,
                ),

              currency_code:
                'MAD',

              duration_days:
                normalized.durationDays,

              seo_title:
                normalized.seoTitle,

              seo_description:
                normalized.seoDescription,

              /*
               * Une annonce refusée redevient un brouillon
               * dès qu’elle est modifiée.
               */
              status:
                'DRAFT',

              submitted_at:
                null,

              reviewed_at:
                null,

              reviewed_by_user_id:
                null,

              rejection_reason:
                null,

              published_at:
                null,

              expires_at:
                null,

              updated_at:
                new Date(),
            },
          });

          await this.replaceListingMedia(
            transaction,
            id,
            dto.media,
          );

          return transaction.marketplace_listings.findUnique({
            where: {
              id,
            },

            include: {
              marketplace_listing_media: {
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

              _count: {
                select: {
                  marketplace_offers:
                    true,
                },
              },
            },
          });
        },
      );

    if (!updated) {
      throw new NotFoundException(
        'Annonce introuvable.',
      );
    }

    await this.writeAudit(
      request,
      user,
      'MARKETPLACE_LISTING_UPDATED',
      updated.id,
      `Modification du brouillon ${updated.reference}.`,
      {
        reference:
          updated.reference,
      },
    );

    return this.formatPrivateListing(
      updated,
    );
  }

  async submitListing(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const listing =
      await this.getOwnedListingRecord(
        id,
        user,
      );

    if (
      listing.status !==
      'DRAFT'
    ) {
      throw new BadRequestException(
        'Seule une annonce en brouillon peut être soumise à validation.',
      );
    }

    const media =
      await this.prisma.marketplace_listing_media.findMany({
        where: {
          marketplace_listing_id:
            id,
        },

        include: {
          media_assets:
            true,
        },
      });

    this.validateSubmissionMedia(
      media,
    );

    const submittedAt =
      new Date();

    const updated =
      await this.prisma.marketplace_listings.update({
        where: {
          id,
        },

        data: {
          status:
            'PENDING_REVIEW',

          submitted_at:
            submittedAt,

          reviewed_at:
            null,

          reviewed_by_user_id:
            null,

          rejection_reason:
            null,

          published_at:
            null,

          expires_at:
            null,

          updated_at:
            submittedAt,
        },

        include: {
          marketplace_listing_media: {
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

          _count: {
            select: {
              marketplace_offers:
                true,
            },
          },
        },
      });

    await this.writeAudit(
      request,
      user,
      'MARKETPLACE_LISTING_SUBMITTED',
      updated.id,
      `Soumission de l’annonce ${updated.reference} à la validation FLASCAM.`,
      {
        reference:
          updated.reference,
      },
    );

    return this.formatPrivateListing(
      updated,
    );
  }

  async withdrawListing(
    id: string,
    user: AuthUser,
    request: Request,
  ) {
    const listing =
      await this.getOwnedListingRecord(
        id,
        user,
      );

    if (
      ![
        'PENDING_REVIEW',
        'PUBLISHED',
      ].includes(
        listing.status,
      )
    ) {
      throw new BadRequestException(
        'Cette annonce ne peut pas être retirée dans son état actuel.',
      );
    }

    const now =
      new Date();

    const updated =
      await this.prisma.marketplace_listings.update({
        where: {
          id,
        },

        data: {
          status:
            'WITHDRAWN',

          withdrawn_at:
            now,

          updated_at:
            now,
        },

        include: {
          marketplace_listing_media: {
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

          _count: {
            select: {
              marketplace_offers:
                true,
            },
          },
        },
      });

    /*
     * Les offres en attente ne doivent plus rester actives
     * après le retrait de l’annonce.
     */
    await this.prisma.marketplace_offers.updateMany({
      where: {
        marketplace_listing_id:
          id,

        status:
          'PENDING',
      },

      data: {
        status:
          'REJECTED',

        responded_at:
          now,

        updated_at:
          now,
      },
    });

    await this.writeAudit(
      request,
      user,
      'MARKETPLACE_LISTING_WITHDRAWN',
      updated.id,
      `Retrait de l’annonce ${updated.reference}.`,
      {
        previousStatus:
          listing.status,

        reference:
          updated.reference,
      },
    );

    return this.formatPrivateListing(
      updated,
    );
  }

  /*
 * ==========================================================
 * ADMINISTRATION FLASCAM
 * ==========================================================
 */

async getAdminListings(
  query:
    AdminMarketplaceListingsQueryDto,
) {
  await this.expireOutdatedListings();

  const page =
    query.page;

  const limit =
    query.limit;

  const skip =
    (page - 1) *
    limit;

  const search =
    query.search?.trim();

  const where:
    Prisma.marketplace_listingsWhereInput =
    {
      deleted_at:
        null,

      ...(query.status
        ? {
            status:
              query.status,
          }
        : {}),

      ...(query.sellerType
        ? {
            seller_type:
              query.sellerType,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                reference: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
              {
                title: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
              {
                brand: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
              {
                model: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
              {
                users_marketplace_listings_owner_user_idTousers: {
                  email: {
                    contains:
                      search,

                    mode:
                      'insensitive',
                  },
                },
              },
            ],
          }
        : {}),
    };

  const [
    listings,
    total,
  ] =
    await Promise.all([
      this.prisma.marketplace_listings.findMany({
        where,

        include: {
          marketplace_listing_media: {
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

          users_marketplace_listings_owner_user_idTousers: {
            select: {
              id:
                true,

              email:
                true,

              first_name:
                true,

              last_name:
                true,

              phone:
                true,

              role_id:
                true,
            },
          },

          regional_associations: {
            select: {
              id:
                true,

              name:
                true,

              slug:
                true,
            },
          },

          adherents: {
            select: {
              id:
                true,

              member_number:
                true,

              display_name:
                true,

              legal_name:
                true,

              status:
                true,
            },
          },

          _count: {
            select: {
              marketplace_offers:
                true,
            },
          },
        },

        orderBy: [
          {
            submitted_at:
              'asc',
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

      this.prisma.marketplace_listings.count({
        where,
      }),
    ]);

  return {
    items:
      listings.map(
        (listing) =>
          this.formatAdminListing(
            listing,
          ),
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

async getAdminListingById(
  id:
    string,
) {
  await this.expireOutdatedListings();

  const listing =
    await this.prisma.marketplace_listings.findFirst({
      where: {
        id,

        deleted_at:
          null,
      },

      include: {
        marketplace_listing_media: {
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

        users_marketplace_listings_owner_user_idTousers: {
          select: {
            id:
              true,

            email:
              true,

            first_name:
              true,

            last_name:
              true,

            phone:
              true,

            is_active:
              true,
          },
        },

        regional_associations: {
          select: {
            id:
              true,

            name:
              true,

            slug:
              true,

            status:
              true,
          },
        },

        adherents: {
          select: {
            id:
              true,

            member_number:
              true,

            display_name:
              true,

            legal_name:
              true,

            status:
              true,
          },
        },

        users_marketplace_listings_reviewed_by_user_idTousers: {
          select: {
            id:
              true,

            email:
              true,

            first_name:
              true,

            last_name:
              true,
          },
        },

        _count: {
          select: {
            marketplace_offers:
              true,
          },
        },
      },
    });

  if (!listing) {
    throw new NotFoundException(
      'Annonce introuvable.',
    );
  }

  return this.formatAdminListing(
    listing,
  );
}

async approveListing(
  id:
    string,

  user:
    AuthUser,

  request:
    Request,
) {
  const result =
    await this.prisma.$transaction(
      async (
        transaction,
      ) => {
        /*
         * Le verrou transactionnel empêche deux administrateurs
         * de valider ou refuser simultanément la même annonce.
         */
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(
            hashtext(${id})
          )
        `;

        const listing =
          await transaction.marketplace_listings.findFirst({
            where: {
              id,

              deleted_at:
                null,
            },

            include: {
              marketplace_listing_media: {
                include: {
                  media_assets:
                    true,
                },
              },
            },
          });

        if (!listing) {
          throw new NotFoundException(
            'Annonce introuvable.',
          );
        }

        if (
          listing.status !==
          'PENDING_REVIEW'
        ) {
          throw new BadRequestException(
            'Seule une annonce en attente de validation peut être publiée.',
          );
        }

        this.validateSubmissionMedia(
          listing.marketplace_listing_media,
        );

        const now =
          new Date();

        const expiresAt =
          new Date(
            now.getTime() +
              listing.duration_days *
                24 *
                60 *
                60 *
                1_000,
          );

        await transaction.marketplace_listings.update({
          where: {
            id:
              listing.id,
          },

          data: {
            status:
              'PUBLISHED',

            reviewed_at:
              now,

            reviewed_by_user_id:
              user.id,

            rejection_reason:
              null,

            published_at:
              now,

            expires_at:
              expiresAt,

            withdrawn_at:
              null,

            updated_at:
              now,
          },
        });

        return transaction.marketplace_listings.findUnique({
          where: {
            id:
              listing.id,
          },

          include: {
            marketplace_listing_media: {
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

            users_marketplace_listings_owner_user_idTousers: {
              select: {
                id:
                  true,

                email:
                  true,

                first_name:
                  true,

                last_name:
                  true,

                phone:
                  true,

                is_active:
                  true,
              },
            },

            regional_associations: {
              select: {
                id:
                  true,

                name:
                  true,

                slug:
                  true,

                status:
                  true,
              },
            },

            adherents: {
              select: {
                id:
                  true,

                member_number:
                  true,

                display_name:
                  true,

                legal_name:
                  true,

                status:
                  true,
              },
            },

            users_marketplace_listings_reviewed_by_user_idTousers: {
              select: {
                id:
                  true,

                email:
                  true,

                first_name:
                  true,

                last_name:
                  true,
              },
            },

            _count: {
              select: {
                marketplace_offers:
                  true,
              },
            },
          },
        });
      },
    );

  if (!result) {
    throw new NotFoundException(
      'Annonce introuvable après validation.',
    );
  }

  await this.writeAudit(
    request,
    user,
    'MARKETPLACE_LISTING_APPROVED',
    result.id,
    `Validation et publication de l’annonce ${result.reference}.`,
    {
      reference:
        result.reference,

      ownerUserId:
        result.owner_user_id,

      expiresAt:
        result.expires_at?.toISOString(),
    },
  );

  return this.formatAdminListing(
    result,
  );
}

async rejectListing(
  id:
    string,

  reason:
    string,

  user:
    AuthUser,

  request:
    Request,
) {
  const normalizedReason =
    reason
      .trim()
      .replace(
        /\s+/g,
        ' ',
      );

  const result =
    await this.prisma.$transaction(
      async (
        transaction,
      ) => {
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(
            hashtext(${id})
          )
        `;

        const listing =
          await transaction.marketplace_listings.findFirst({
            where: {
              id,

              deleted_at:
                null,
            },
          });

        if (!listing) {
          throw new NotFoundException(
            'Annonce introuvable.',
          );
        }

        if (
          listing.status !==
          'PENDING_REVIEW'
        ) {
          throw new BadRequestException(
            'Seule une annonce en attente de validation peut être refusée.',
          );
        }

        const now =
          new Date();

        await transaction.marketplace_listings.update({
          where: {
            id:
              listing.id,
          },

          data: {
            status:
              'REJECTED',

            reviewed_at:
              now,

            reviewed_by_user_id:
              user.id,

            rejection_reason:
              normalizedReason,

            published_at:
              null,

            expires_at:
              null,

            updated_at:
              now,
          },
        });

        return transaction.marketplace_listings.findUnique({
          where: {
            id:
              listing.id,
          },

          include: {
            marketplace_listing_media: {
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

            users_marketplace_listings_owner_user_idTousers: {
              select: {
                id:
                  true,

                email:
                  true,

                first_name:
                  true,

                last_name:
                  true,

                phone:
                  true,

                is_active:
                  true,
              },
            },

            regional_associations: {
              select: {
                id:
                  true,

                name:
                  true,

                slug:
                  true,

                status:
                  true,
              },
            },

            adherents: {
              select: {
                id:
                  true,

                member_number:
                  true,

                display_name:
                  true,

                legal_name:
                  true,

                status:
                  true,
              },
            },

            users_marketplace_listings_reviewed_by_user_idTousers: {
              select: {
                id:
                  true,

                email:
                  true,

                first_name:
                  true,

                last_name:
                  true,
              },
            },

            _count: {
              select: {
                marketplace_offers:
                  true,
              },
            },
          },
        });
      },
    );

  if (!result) {
    throw new NotFoundException(
      'Annonce introuvable après refus.',
    );
  }

  await this.writeAudit(
    request,
    user,
    'MARKETPLACE_LISTING_REJECTED',
    result.id,
    `Refus de l’annonce ${result.reference}.`,
    {
      reference:
        result.reference,

      ownerUserId:
        result.owner_user_id,

      reason:
        normalizedReason,
    },
  );

  return this.formatAdminListing(
    result,
  );
}

  /*
   * ==========================================================
   * EXPIRATION AUTOMATIQUE
   * ==========================================================
   */

  @Cron(
    CronExpression.EVERY_10_MINUTES,
  )
  async expireOutdatedListings() {
    const now =
      new Date();

    const expired =
      await this.prisma.marketplace_listings.findMany({
        where: {
          status:
            'PUBLISHED',

          deleted_at:
            null,

          expires_at: {
            not:
              null,

            lte:
              now,
          },
        },

        select: {
          id:
            true,

          reference:
            true,
        },
      });

    if (
      expired.length ===
      0
    ) {
      return {
        expiredCount:
          0,
      };
    }

    const ids =
      expired.map(
        (listing) =>
          listing.id,
      );

    await this.prisma.$transaction([
      this.prisma.marketplace_listings.updateMany({
        where: {
          id: {
            in:
              ids,
          },

          status:
            'PUBLISHED',
        },

        data: {
          status:
            'EXPIRED',

          updated_at:
            now,
        },
      }),

      this.prisma.marketplace_offers.updateMany({
        where: {
          marketplace_listing_id: {
            in:
              ids,
          },

          status:
            'PENDING',
        },

        data: {
          status:
            'REJECTED',

          responded_at:
            now,

          updated_at:
            now,
        },
      }),
    ]);

    return {
      expiredCount:
        ids.length,
    };
  }

  /*
   * ==========================================================
   * CONTRÔLES DE PÉRIMÈTRE
   * ==========================================================
   */

  private async resolveSellerScope(
    user:
      AuthUser,
  ): Promise<SellerScope> {
    if (
      [
        'SUPER_ADMIN',
        'FLASCAM_ADMIN',
      ].includes(
        user.role,
      )
    ) {
      return {
        sellerType:
          'FLASCAM',

        regionalAssociationId:
          null,

        adherentId:
          null,
      };
    }

    if (
      user.role ===
      'ASSOCIATION_ADMIN'
    ) {
      if (
        !user.regionalAssociationId
      ) {
        throw new ForbiddenException(
          'Aucune association n’est rattachée à ce compte.',
        );
      }

      const association =
        await this.prisma.regional_associations.findFirst({
          where: {
            id:
              user.regionalAssociationId,

            deleted_at:
              null,
          },

          select: {
            id:
              true,

            status:
              true,
          },
        });

      if (!association) {
        throw new ForbiddenException(
          'L’association liée à ce compte est introuvable.',
        );
      }

      return {
        sellerType:
          'ASSOCIATION',

        regionalAssociationId:
          association.id,

        adherentId:
          null,
      };
    }

    if (
      user.role ===
      'ADHERENT'
    ) {
      const adherent =
        await this.prisma.adherents.findFirst({
          where: {
            user_id:
              user.id,

            status:
              'APPROVED',

            deleted_at:
              null,
          },

          select: {
            id:
              true,

            regional_association_id:
              true,
          },
        });

      if (!adherent) {
        throw new ForbiddenException(
          'Seul un adhérent approuvé peut publier une annonce.',
        );
      }

      return {
        sellerType:
          'ADHERENT',

        regionalAssociationId:
          adherent.regional_association_id,

        adherentId:
          adherent.id,
      };
    }

    throw new ForbiddenException(
      'Ce compte n’est pas autorisé à publier des véhicules.',
    );
  }

  private async getOwnedListingRecord(
    id: string,
    user: AuthUser,
  ) {
    const listing =
      await this.prisma.marketplace_listings.findFirst({
        where: {
          id,

          owner_user_id:
            user.id,

          deleted_at:
            null,
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Annonce introuvable.',
      );
    }

    return listing;
  }

  /*
   * ==========================================================
   * VALIDATION DES MÉDIAS
   * ==========================================================
   */

  private validateDtoMedia(
    media:
      MarketplaceListingMediaInputDto[],
  ) {
    const images =
      media.filter(
        (item) =>
          item.mediaKind ===
          'IMAGE',
      );

    const videos =
      media.filter(
        (item) =>
          item.mediaKind ===
          'VIDEO',
      );

    if (
      images.length >
      MARKETPLACE_MAX_IMAGES
    ) {
      throw new BadRequestException(
        `Une annonce peut contenir au maximum ${MARKETPLACE_MAX_IMAGES} images.`,
      );
    }

    if (
      videos.length >
      MARKETPLACE_MAX_VIDEOS
    ) {
      throw new BadRequestException(
        'Une annonce ne peut contenir qu’une seule vidéo.',
      );
    }

    const assetIds =
      media.map(
        (item) =>
          item.mediaAssetId,
      );

    if (
      new Set(
        assetIds,
      ).size !==
      assetIds.length
    ) {
      throw new BadRequestException(
        'Un même média ne peut pas être ajouté plusieurs fois à l’annonce.',
      );
    }

    const orders =
      media.map(
        (item) =>
          item.displayOrder,
      );

    if (
      new Set(
        orders,
      ).size !==
      orders.length
    ) {
      throw new BadRequestException(
        'Deux médias ne peuvent pas avoir le même ordre d’affichage.',
      );
    }
  }

  private validateSubmissionMedia(
    media: Array<{
      media_kind:
        string;

      media_assets: {
        media_type:
          string;

        status:
          string;

        deleted_at:
          Date | null;
      };
    }>,
  ) {
    const images =
      media.filter(
        (item) =>
          item.media_kind ===
          'IMAGE',
      );

    if (
      images.length ===
      0
    ) {
      throw new BadRequestException(
        'Ajoutez au moins une image avant de soumettre l’annonce.',
      );
    }

    const invalidMedia =
      media.find(
        (item) =>
          item.media_assets.deleted_at !==
            null ||
          item.media_assets.status !==
            'PUBLISHED' ||
          item.media_assets.media_type !==
            item.media_kind,
      );

    if (invalidMedia) {
      throw new BadRequestException(
        'Un ou plusieurs médias de l’annonce ne sont plus valides.',
      );
    }
  }

  private async validateMediaAssets(
    transaction:
      MarketplaceTransaction,

    media:
      MarketplaceListingMediaInputDto[],

    user:
      AuthUser,
  ) {
    if (
      media.length ===
      0
    ) {
      return;
    }

    const assetIds =
      media.map(
        (item) =>
          item.mediaAssetId,
      );

    const assets =
      await transaction.media_assets.findMany({
        where: {
          id: {
            in:
              assetIds,
          },

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

  visibility:
    true,

  status:
    true,

  metadata:
    true,
},
      });

    if (
      assets.length !==
      assetIds.length
    ) {
      throw new BadRequestException(
        'Un ou plusieurs médias sont introuvables.',
      );
    }

    const assetsById =
      new Map(
        assets.map(
          (asset) => [
            asset.id,
            asset,
          ],
        ),
      );

    for (
      const input of
      media
    ) {
      const asset =
        assetsById.get(
          input.mediaAssetId,
        );

      if (!asset) {
        throw new BadRequestException(
          'Média introuvable.',
        );
      }

const metadata =
  asset.metadata &&
  typeof asset.metadata ===
    'object' &&
  !Array.isArray(
    asset.metadata,
  )
    ? asset.metadata as
        Prisma.JsonObject
    : null;

if (
  metadata?.module !==
  'MARKETPLACE'
) {
  throw new BadRequestException(
    'Ce média n’a pas été importé pour la marketplace.',
  );
}

      if (
        asset.uploaded_by_user_id !==
        user.id
      ) {
        throw new ForbiddenException(
          'Vous ne pouvez pas utiliser un média importé par un autre utilisateur.',
        );
      }

      if (
        asset.media_type !==
        input.mediaKind
      ) {
        throw new BadRequestException(
          `Le média ${input.mediaAssetId} ne correspond pas au type ${input.mediaKind}.`,
        );
      }

if (
  metadata.uploadPurpose !==
  input.mediaKind
) {
  throw new BadRequestException(
    'Le type déclaré du média ne correspond pas à son usage marketplace.',
  );
}      

      if (
        asset.status !==
        'PUBLISHED'
      ) {
        throw new BadRequestException(
          'Seuls les médias publiés peuvent être associés à une annonce.',
        );
      }

      if (
        asset.visibility !==
        'PUBLIC'
      ) {
        throw new BadRequestException(
          'Les médias de la marketplace doivent être publics.',
        );
      }
    }
  }

  private async replaceListingMedia(
    transaction:
      MarketplaceTransaction,

    listingId:
      string,

    media:
      MarketplaceListingMediaInputDto[],
  ) {
    await transaction.marketplace_listing_media.deleteMany({
      where: {
        marketplace_listing_id:
          listingId,
      },
    });

    if (
      media.length ===
      0
    ) {
      return;
    }

    await transaction.marketplace_listing_media.createMany({
      data:
        media.map(
          (item) => ({
            marketplace_listing_id:
              listingId,

            media_asset_id:
              item.mediaAssetId,

            media_kind:
              item.mediaKind,

            display_order:
              item.displayOrder,

            alt_text:
              this.cleanOptionalText(
                item.altText,
              ),

            caption:
              this.cleanOptionalText(
                item.caption,
              ),
          }),
        ),
    });
  }

  /*
   * ==========================================================
   * NORMALISATION
   * ==========================================================
   */

  private normalizeListingDto(
    dto:
      UpsertMarketplaceListingDto,
  ) {
    const firstRegistrationDate =
      dto.firstRegistrationDate
        ? new Date(
            dto.firstRegistrationDate,
          )
        : null;

    if (
      firstRegistrationDate &&
      Number.isNaN(
        firstRegistrationDate.getTime(),
      )
    ) {
      throw new BadRequestException(
        'La date de première mise en circulation est invalide.',
      );
    }

    if (
      firstRegistrationDate &&
      firstRegistrationDate.getFullYear() !==
        dto.registrationYear
    ) {
      throw new BadRequestException(
        'L’année de première mise en circulation doit correspondre à l’année du véhicule.',
      );
    }

    return {
      title:
        this.requireText(
          dto.title,
          'Le titre',
        ),

      description:
        this.cleanOptionalText(
          dto.description,
        ),

      vehicleType:
        dto.vehicleType,

      brand:
        this.requireText(
          dto.brand,
          'La marque',
        ),

      model:
        this.requireText(
          dto.model,
          'Le modèle',
        ),

      version:
        this.cleanOptionalText(
          dto.version,
        ),

      registrationYear:
        dto.registrationYear,

      firstRegistrationDate,

      mileageKm:
        dto.mileageKm,

      fuelType:
        dto.fuelType,

      transmission:
        dto.transmission,

      fiscalPower:
        dto.fiscalPower ??
        null,

      enginePowerHp:
        dto.enginePowerHp ??
        null,

      engineCapacityCc:
        dto.engineCapacityCc ??
        null,

      bodyType:
        this.cleanOptionalText(
          dto.bodyType,
        ),

      exteriorColor:
        this.cleanOptionalText(
          dto.exteriorColor,
        ),

      interiorColor:
        this.cleanOptionalText(
          dto.interiorColor,
        ),

      doorsCount:
        dto.doorsCount ??
        null,

      seatsCount:
        dto.seatsCount ??
        null,

      registrationCity:
        this.cleanOptionalText(
          dto.registrationCity,
        ),

      requestedPrice:
        dto.requestedPrice,

      durationDays:
        dto.durationDays,

      seoTitle:
        this.cleanOptionalText(
          dto.seoTitle,
        ),

      seoDescription:
        this.cleanOptionalText(
          dto.seoDescription,
        ),
    };
  }

  private requireText(
    value: string,
    fieldName: string,
  ) {
    const cleaned =
      value
        .trim()
        .replace(
          /\s+/g,
          ' ',
        );

    if (!cleaned) {
      throw new BadRequestException(
        `${fieldName} est obligatoire.`,
      );
    }

    return cleaned;
  }

private cleanOptionalText(
  value?:
    string,
) {
  const cleaned =
    value?.trim();

  return cleaned ||
    null;
}

private cleanSingleLineText(
  value?:
    string,
) {
  const cleaned =
    value
      ?.trim()
      .replace(
        /\s+/g,
        ' ',
      );

  return cleaned ||
    null;
}

  /*
   * ==========================================================
   * GÉNÉRATION DE LA RÉFÉRENCE ET DU SLUG
   * ==========================================================
   */

  private async generateUniqueReference(
    transaction:
      MarketplaceTransaction,
  ) {
    for (
      let attempt = 0;
      attempt < 10;
      attempt += 1
    ) {
      const randomPart =
        crypto.randomUUID()
          .replace(
            /-/g,
            '',
          )
          .slice(
            0,
            8,
          )
          .toUpperCase();

      const reference =
        `MKT-${randomPart}`;

      const existing =
        await transaction.marketplace_listings.findUnique({
          where: {
            reference,
          },

          select: {
            id:
              true,
          },
        });

      if (!existing) {
        return reference;
      }
    }

    throw new BadRequestException(
      'Impossible de générer une référence unique. Réessayez.',
    );
  }

  private async generateUniqueSlug(
    transaction:
      MarketplaceTransaction,

    brand:
      string,

    model:
      string,

    registrationYear:
      number,

    reference:
      string,
  ) {
    const base =
      this.slugify(
        `${brand}-${model}-${registrationYear}-${reference}`,
      );

    let slug =
      base;

    let suffix =
      1;

    while (
      await transaction.marketplace_listings.findUnique({
        where: {
          slug,
        },

        select: {
          id:
            true,
        },
      })
    ) {
      suffix +=
        1;

      slug =
        `${base}-${suffix}`;
    }

    return slug;
  }

  private slugify(
    value:
      string,
  ) {
    return value
      .normalize(
        'NFD',
      )
      .replace(
        /[\u0300-\u036f]/g,
        '',
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        '-',
      )
      .replace(
        /^-+|-+$/g,
        '')
      .slice(
        0,
        170,
      );
  }

  /*
   * ==========================================================
   * RECHERCHE PUBLIQUE
   * ==========================================================
   */

  private buildPublicWhere(
    query:
      PublicMarketplaceListingsQueryDto,
  ): Prisma.marketplace_listingsWhereInput {
    const now =
      new Date();

    const search =
      query.search?.trim();

    return {
      status:
        'PUBLISHED',

      deleted_at:
        null,

      published_at: {
        not:
          null,

        lte:
          now,
      },

      expires_at: {
        not:
          null,

        gt:
          now,
      },

      ...(query.vehicleType
        ? {
            vehicle_type:
              query.vehicleType,
          }
        : {}),

      ...(query.brand
        ? {
            brand: {
              equals:
                query.brand.trim(),

              mode:
                'insensitive',
            },
          }
        : {}),

      ...(query.model
        ? {
            model: {
              contains:
                query.model.trim(),

              mode:
                'insensitive',
            },
          }
        : {}),

      ...(query.fuelType
        ? {
            fuel_type:
              query.fuelType,
          }
        : {}),

      ...(query.transmission
        ? {
            transmission:
              query.transmission,
          }
        : {}),

      ...(
        query.minimumYear !==
          undefined ||
        query.maximumYear !==
          undefined
          ? {
              registration_year: {
                ...(query.minimumYear !==
                undefined
                  ? {
                      gte:
                        query.minimumYear,
                    }
                  : {}),

                ...(query.maximumYear !==
                undefined
                  ? {
                      lte:
                        query.maximumYear,
                    }
                  : {}),
              },
            }
          : {}
      ),

      ...(
        query.minimumPrice !==
          undefined ||
        query.maximumPrice !==
          undefined
          ? {
              requested_price: {
                ...(query.minimumPrice !==
                undefined
                  ? {
                      gte:
                        new Prisma.Decimal(
                          query.minimumPrice,
                        ),
                    }
                  : {}),

                ...(query.maximumPrice !==
                undefined
                  ? {
                      lte:
                        new Prisma.Decimal(
                          query.maximumPrice,
                        ),
                    }
                  : {}),
              },
            }
          : {}
      ),

      ...(query.maximumMileageKm !==
      undefined
        ? {
            mileage_km: {
              lte:
                query.maximumMileageKm,
            },
          }
        : {}),

      ...(search
        ? {
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
                brand: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
              {
                model: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
              {
                version: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
              {
                body_type: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
              {
                registration_city: {
                  contains:
                    search,

                  mode:
                    'insensitive',
                },
              },
            ],
          }
        : {}),
    };
  }

  private buildPublicOrderBy(
    sort:
      string,
  ): Prisma.marketplace_listingsOrderByWithRelationInput[] {
    switch (sort) {
      case 'PRICE_ASC':
        return [
          {
            requested_price:
              'asc',
          },
          {
            published_at:
              'desc',
          },
        ];

      case 'PRICE_DESC':
        return [
          {
            requested_price:
              'desc',
          },
          {
            published_at:
              'desc',
          },
        ];

      case 'YEAR_DESC':
        return [
          {
            registration_year:
              'desc',
          },
          {
            published_at:
              'desc',
          },
        ];

      case 'MILEAGE_ASC':
        return [
          {
            mileage_km:
              'asc',
          },
          {
            published_at:
              'desc',
          },
        ];

      case 'RECENT':
      default:
        return [
          {
            published_at:
              'desc',
          },
          {
            created_at:
              'desc',
          },
        ];
    }
  }

  /*
   * ==========================================================
   * FORMATAGE DES RÉPONSES
   * ==========================================================
   */

  private formatPublicListingCard(
    listing: any,
  ) {
    const media =
      this.formatMedia(
        listing.marketplace_listing_media,
      );

    return {
      id:
        listing.id,

      reference:
        listing.reference,

      slug:
        listing.slug,

      title:
        listing.title,

      vehicleType:
        listing.vehicle_type,

      brand:
        listing.brand,

      model:
        listing.model,

      version:
        listing.version,

      registrationYear:
        listing.registration_year,

      mileageKm:
        listing.mileage_km,

      fuelType:
        listing.fuel_type,

      transmission:
        listing.transmission,

      bodyType:
        listing.body_type,

      requestedPrice:
        Number(
          listing.requested_price,
        ),

      currencyCode:
        listing.currency_code,

      publishedAt:
        listing.published_at,

      expiresAt:
        listing.expires_at,

      remainingDays:
        this.calculateRemainingDays(
          listing.expires_at,
        ),

      coverMedia:
        media[0] ??
        null,

      mediaCount:
        media.length,
    };
  }

  private formatPublicListingDetail(
    listing: any,
  ) {
    return {
      ...this.formatPublicListingCard(
        listing,
      ),

      description:
        listing.description,

      firstRegistrationDate:
        listing.first_registration_date,

      fiscalPower:
        listing.fiscal_power,

      enginePowerHp:
        listing.engine_power_hp,

      engineCapacityCc:
        listing.engine_capacity_cc,

      exteriorColor:
        listing.exterior_color,

      interiorColor:
        listing.interior_color,

      doorsCount:
        listing.doors_count,

      seatsCount:
        listing.seats_count,

      registrationCity:
        listing.registration_city,

      media:
        this.formatMedia(
          listing.marketplace_listing_media,
        ),

      seo: {
        title:
          listing.seo_title ||
          listing.title,

        description:
          listing.seo_description ||
          listing.description,
      },
    };
  }

  private formatPrivateListing(
    listing: any,
  ) {
    return {
      id:
        listing.id,

      reference:
        listing.reference,

      slug:
        listing.slug,

      sellerType:
        listing.seller_type,

      status:
        listing.status,

      title:
        listing.title,

      description:
        listing.description,

      vehicleType:
        listing.vehicle_type,

      brand:
        listing.brand,

      model:
        listing.model,

      version:
        listing.version,

      registrationYear:
        listing.registration_year,

      firstRegistrationDate:
        listing.first_registration_date,

      mileageKm:
        listing.mileage_km,

      fuelType:
        listing.fuel_type,

      transmission:
        listing.transmission,

      fiscalPower:
        listing.fiscal_power,

      enginePowerHp:
        listing.engine_power_hp,

      engineCapacityCc:
        listing.engine_capacity_cc,

      bodyType:
        listing.body_type,

      exteriorColor:
        listing.exterior_color,

      interiorColor:
        listing.interior_color,

      doorsCount:
        listing.doors_count,

      seatsCount:
        listing.seats_count,

      registrationCity:
        listing.registration_city,

      requestedPrice:
        Number(
          listing.requested_price,
        ),

      currencyCode:
        listing.currency_code,

      durationDays:
        listing.duration_days,

      submittedAt:
        listing.submitted_at,

      reviewedAt:
        listing.reviewed_at,

      rejectionReason:
        listing.rejection_reason,

      publishedAt:
        listing.published_at,

      expiresAt:
        listing.expires_at,

      soldAt:
        listing.sold_at,

      withdrawnAt:
        listing.withdrawn_at,

      remainingDays:
        this.calculateRemainingDays(
          listing.expires_at,
        ),

      seoTitle:
        listing.seo_title,

      seoDescription:
        listing.seo_description,

      media:
        this.formatMedia(
          listing.marketplace_listing_media,
        ),

      offersCount:
        listing._count
          ?.marketplace_offers ??
        0,

      createdAt:
        listing.created_at,

      updatedAt:
        listing.updated_at,
    };
  }

private formatAdminListing(
  listing:
    any,
) {
  const owner =
    listing
      .users_marketplace_listings_owner_user_idTousers;

  const reviewer =
    listing
      .users_marketplace_listings_reviewed_by_user_idTousers;

  return {
    ...this.formatPrivateListing(
      listing,
    ),

    owner: owner
      ? {
          id:
            owner.id,

          firstName:
            owner.first_name,

          lastName:
            owner.last_name,

          email:
            owner.email,

          phone:
            owner.phone,

          isActive:
            owner.is_active,
        }
      : null,

    association:
      listing.regional_associations
        ? {
            id:
              listing
                .regional_associations
                .id,

            name:
              listing
                .regional_associations
                .name,

            slug:
              listing
                .regional_associations
                .slug,

            status:
              listing
                .regional_associations
                .status,
          }
        : null,

    adherent:
      listing.adherents
        ? {
            id:
              listing
                .adherents
                .id,

            membershipNumber:
            listing
                .adherents
                .member_number,

            displayName:
              listing
                .adherents
                .display_name,

            legalName:
              listing
                .adherents
                .legal_name,

            status:
              listing
                .adherents
                .status,
          }
        : null,

    reviewedBy: reviewer
      ? {
          id:
            reviewer.id,

          firstName:
            reviewer.first_name,

          lastName:
            reviewer.last_name,

          email:
            reviewer.email,
        }
      : null,
  };
}  

  private formatMedia(
    relations:
      any[],
  ) {
    return relations.map(
      (relation) => {
        const asset =
          relation.media_assets;

        return {
          id:
            relation.id,

          mediaAssetId:
            relation.media_asset_id,

          mediaKind:
            relation.media_kind,

          displayOrder:
            relation.display_order,

          altText:
            relation.alt_text ||
            asset.alt_text,

          caption:
            relation.caption ||
            asset.caption,

          url:
            this.buildMediaUrl(
              asset.object_key,
              asset.bucket_name,
            ),

          mimeType:
            asset.mime_type,

          width:
            asset.width,

          height:
            asset.height,

          durationSeconds:
            asset.duration_seconds !==
            null
              ? Number(
                  asset.duration_seconds,
                )
              : null,

          originalFilename:
            asset.original_filename,
        };
      },
    );
  }

  private calculateRemainingDays(
    expiresAt:
      Date | null,
  ) {
    if (!expiresAt) {
      return null;
    }

    const milliseconds =
      expiresAt.getTime() -
      Date.now();

    if (
      milliseconds <=
      0
    ) {
      return 0;
    }

    return Math.ceil(
      milliseconds /
        (
          1000 *
          60 *
          60 *
          24
        ),
    );
  }

private buildMediaUrl(
  objectKey:
    string,

  _bucketName?:
    string,
) {
  const baseUrl =
    this.config.get<string>(
      'PUBLIC_MEDIA_BASE_URL',
      '',
    );

  if (!baseUrl) {
    return objectKey;
  }

  return `${
    baseUrl.replace(
      /\/+$/,
      '',
    )
  }/${
    objectKey.replace(
      /^\/+/,
      '',
    )
  }`;
}

  /*
   * ==========================================================
   * AUDIT
   * ==========================================================
   */

  private async writeAudit(
    request:
      Request,

    user:
      AuthUser,

    action:
      string,

    entityId:
      string,

    description:
      string,

    metadata?:
      Prisma.InputJsonObject,
  ) {
    await this.auditLogs.log({
      userId:
        user.id,

      action,

      entityType:
        'MARKETPLACE_LISTING',

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