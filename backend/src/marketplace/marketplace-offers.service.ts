import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import type {
  Request,
} from 'express';

import {
  Prisma,
} from '../generated/prisma/client';

import {
  NonVotingAdherentsService,
} from '../non-voting-adherents/non-voting-adherents.service';

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
  CreateMarketplaceOfferDto,
} from './dto/create-marketplace-offer.dto';

import {
  MarketplaceOffersQueryDto,
} from './dto/marketplace-offers-query.dto';

type MarketplaceTransaction =
  Prisma.TransactionClient;

@Injectable()
export class MarketplaceOffersService {
constructor(
  private readonly prisma:
    PrismaService,

  private readonly auditLogs:
    AuditLogsService,

private readonly config:
  ConfigService,

private readonly nonVotingAdherents:
  NonVotingAdherentsService,
) {}

  async createOffer(
    listingId: string,
    dto:
      CreateMarketplaceOfferDto,
    user:
      AuthUser,
    request:
      Request,
) {
  await this.nonVotingAdherents.assertCanSubmitOffer(
    user,
  );

  const listing =
    await this.prisma.marketplace_listings.findFirst({
        where: {
          id:
            listingId,

          status:
            'PUBLISHED',

          deleted_at:
            null,

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
        },

        select: {
          id:
            true,

          owner_user_id:
            true,

          title:
            true,

          reference:
            true,
        },
      });

    if (!listing) {
      throw new NotFoundException(
        'Cette annonce n’est plus disponible.',
      );
    }

    if (
      listing.owner_user_id ===
      user.id
    ) {
      throw new BadRequestException(
        'Vous ne pouvez pas déposer une offre sur votre propre annonce.',
      );
    }

    const existingPending =
      await this.prisma.marketplace_offers.findFirst({
        where: {
          marketplace_listing_id:
            listing.id,

          buyer_user_id:
            user.id,

          status:
            'PENDING',
        },

        select: {
          id:
            true,
        },
      });

    if (existingPending) {
      throw new BadRequestException(
        'Vous avez déjà une offre en attente sur ce véhicule.',
      );
    }

    const message =
      dto.message
        ?.trim() ||
      null;

    let offer;

    try {
      offer =
        await this.prisma.marketplace_offers.create({
          data: {
            marketplace_listing_id:
              listing.id,

            buyer_user_id:
              user.id,

            amount:
              new Prisma.Decimal(
                dto.amount,
              ),

            currency_code:
              'MAD',

            message,

            status:
              'PENDING',
          },

          include:
            this.offerInclude(),
        });
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code ===
          'P2002'
      ) {
        throw new BadRequestException(
          'Vous avez déjà une offre en attente sur ce véhicule.',
        );
      }

      throw error;
    }

    await this.writeAudit(
      request,
      user,
      'MARKETPLACE_OFFER_CREATED',
      offer.id,
      `Offre déposée sur l’annonce ${listing.reference}.`,
      {
        listingId:
          listing.id,

        amount:
          dto.amount,
      },
    );

    return this.formatSentOffer(
      offer,
    );
  }

  async getSentOffers(
    query:
      MarketplaceOffersQueryDto,
    user:
      AuthUser,
  ) {
    const skip =
      (
        query.page -
        1
      ) *
      query.limit;

    const where:
      Prisma.marketplace_offersWhereInput = {
        buyer_user_id:
          user.id,

        ...(query.status
          ? {
              status:
                query.status,
            }
          : {}),
      };

    const [
      offers,
      total,
    ] =
      await Promise.all([
        this.prisma.marketplace_offers.findMany({
          where,

          include:
            this.offerInclude(),

          orderBy: {
            submitted_at:
              'desc',
          },

          skip,

          take:
            query.limit,
        }),

        this.prisma.marketplace_offers.count({
          where,
        }),
      ]);

    return {
      items:
        offers.map(
          (
            offer,
          ) =>
            this.formatSentOffer(
              offer,
            ),
        ),

      pagination: {
        page:
          query.page,

        limit:
          query.limit,

        total,

        totalPages:
          Math.ceil(
            total /
              query.limit,
          ),
      },
    };
  }

  async getReceivedOffers(
    query:
      MarketplaceOffersQueryDto,
    user:
      AuthUser,
  ) {
    const skip =
      (
        query.page -
        1
      ) *
      query.limit;

    const where:
      Prisma.marketplace_offersWhereInput = {
        marketplace_listings: {
          owner_user_id:
            user.id,

          deleted_at:
            null,
        },

        ...(query.status
          ? {
              status:
                query.status,
            }
          : {}),
      };

    const [
      offers,
      total,
    ] =
      await Promise.all([
        this.prisma.marketplace_offers.findMany({
          where,

          include:
            this.offerInclude(),

          orderBy: {
            submitted_at:
              'desc',
          },

          skip,

          take:
            query.limit,
        }),

        this.prisma.marketplace_offers.count({
          where,
        }),
      ]);

    return {
      items:
        offers.map(
          (
            offer,
          ) =>
            this.formatReceivedOffer(
              offer,
            ),
        ),

      pagination: {
        page:
          query.page,

        limit:
          query.limit,

        total,

        totalPages:
          Math.ceil(
            total /
              query.limit,
          ),
      },
    };
  }

  async cancelOffer(
    offerId: string,
    user:
      AuthUser,
    request:
      Request,
  ) {
    const offer =
      await this.prisma.marketplace_offers.findFirst({
        where: {
          id:
            offerId,

          buyer_user_id:
            user.id,
        },

        include:
          this.offerInclude(),
      });

    if (!offer) {
      throw new NotFoundException(
        'Offre introuvable.',
      );
    }

    if (
      offer.status !==
      'PENDING'
    ) {
      throw new BadRequestException(
        'Seule une offre en attente peut être annulée.',
      );
    }

    const updated =
      await this.prisma.marketplace_offers.update({
        where: {
          id:
            offer.id,
        },

        data: {
          status:
            'CANCELLED',

          cancelled_at:
            new Date(),

          updated_at:
            new Date(),
        },

        include:
          this.offerInclude(),
      });

    await this.writeAudit(
      request,
      user,
      'MARKETPLACE_OFFER_CANCELLED',
      offer.id,
      'Offre marketplace annulée par l’acheteur.',
      {
        listingId:
          offer.marketplace_listing_id,
      },
    );

    return this.formatSentOffer(
      updated,
    );
  }

  async rejectOffer(
    offerId: string,
    user:
      AuthUser,
    request:
      Request,
  ) {
    const offer =
      await this.prisma.marketplace_offers.findFirst({
        where: {
          id:
            offerId,

          marketplace_listings: {
            owner_user_id:
              user.id,
          },
        },

        include:
          this.offerInclude(),
      });

    if (!offer) {
      throw new NotFoundException(
        'Offre introuvable.',
      );
    }

    if (
      offer.status !==
      'PENDING'
    ) {
      throw new BadRequestException(
        'Seule une offre en attente peut être refusée.',
      );
    }

    const updated =
      await this.prisma.marketplace_offers.update({
        where: {
          id:
            offer.id,
        },

        data: {
          status:
            'REJECTED',

          responded_at:
            new Date(),

          updated_at:
            new Date(),
        },

        include:
          this.offerInclude(),
      });

    await this.writeAudit(
      request,
      user,
      'MARKETPLACE_OFFER_REJECTED',
      offer.id,
      'Offre marketplace refusée par le vendeur.',
      {
        listingId:
          offer.marketplace_listing_id,
      },
    );

    return this.formatReceivedOffer(
      updated,
    );
  }

  async acceptOffer(
    offerId: string,
    user:
      AuthUser,
    request:
      Request,
  ) {
    const acceptedOffer =
      await this.prisma.$transaction(
        async (
          tx,
        ) => {
          await tx.$queryRaw`
            SELECT id
            FROM marketplace_offers
            WHERE id = ${offerId}::uuid
            FOR UPDATE
          `;

          const offer =
            await tx.marketplace_offers.findUnique({
              where: {
                id:
                  offerId,
              },

              include:
                this.offerInclude(),
            });

          if (!offer) {
            throw new NotFoundException(
              'Offre introuvable.',
            );
          }

          if (
            offer.marketplace_listings.owner_user_id !==
            user.id
          ) {
            throw new ForbiddenException(
              'Vous ne pouvez pas traiter cette offre.',
            );
          }

          await tx.$queryRaw`
            SELECT id
            FROM marketplace_listings
            WHERE id = ${offer.marketplace_listing_id}::uuid
            FOR UPDATE
          `;

          if (
            offer.status !==
            'PENDING'
          ) {
            throw new BadRequestException(
              'Cette offre a déjà été traitée.',
            );
          }

          if (
            offer.marketplace_listings.status !==
            'PUBLISHED'
          ) {
            throw new BadRequestException(
              'Cette annonce n’est plus disponible.',
            );
          }

          const existingDeal =
            await tx.marketplace_deals.findUnique({
              where: {
                marketplace_listing_id:
                  offer.marketplace_listing_id,
              },

              select: {
                id:
                  true,
              },
            });

          if (existingDeal) {
            throw new BadRequestException(
              'Une offre a déjà été acceptée pour cette annonce.',
            );
          }

          const seller =
            await tx.users.findFirst({
              where: {
                id:
                  user.id,

                deleted_at:
                  null,
              },

              select: {
                id:
                  true,

                first_name:
                  true,

                last_name:
                  true,

                email:
                  true,

                phone:
                  true,
              },
            });

          const buyer =
            offer.users;

          if (!seller) {
            throw new NotFoundException(
              'Compte vendeur introuvable.',
            );
          }

          const now =
            new Date();

          await tx.marketplace_offers.update({
            where: {
              id:
                offer.id,
            },

            data: {
              status:
                'ACCEPTED',

              responded_at:
                now,

              updated_at:
                now,
            },
          });

          await tx.marketplace_offers.updateMany({
            where: {
              marketplace_listing_id:
                offer.marketplace_listing_id,

              id: {
                not:
                  offer.id,
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
          });

          await tx.marketplace_listings.update({
            where: {
              id:
                offer.marketplace_listing_id,
            },

            data: {
              status:
                'SOLD',

              sold_at:
                now,

              updated_at:
                now,
            },
          });

          await tx.marketplace_deals.create({
            data: {
              marketplace_listing_id:
                offer.marketplace_listing_id,

              marketplace_offer_id:
                offer.id,

              seller_user_id:
                seller.id,

              buyer_user_id:
                buyer.id,

              seller_first_name:
                seller.first_name,

              seller_last_name:
                seller.last_name,

              seller_email:
                seller.email,

              seller_phone:
                seller.phone,

              buyer_first_name:
                buyer.first_name,

              buyer_last_name:
                buyer.last_name,

              buyer_email:
                buyer.email,

              buyer_phone:
                buyer.phone,

              accepted_amount:
                offer.amount,

              currency_code:
                'MAD',
            },
          });

          return await tx.marketplace_offers.findUniqueOrThrow({
            where: {
              id:
                offer.id,
            },

            include:
              this.offerInclude(),
          });
        },
        {
          isolationLevel:
            Prisma.TransactionIsolationLevel.Serializable,
        },
      );

    await this.writeAudit(
      request,
      user,
      'MARKETPLACE_OFFER_ACCEPTED',
      acceptedOffer.id,
      'Offre marketplace acceptée. Les coordonnées ont été échangées.',
      {
        listingId:
          acceptedOffer.marketplace_listing_id,

        buyerUserId:
          acceptedOffer.buyer_user_id,

        amount:
          Number(
            acceptedOffer.amount,
          ),
      },
    );

    return this.formatReceivedOffer(
      acceptedOffer,
    );
  }

  private offerInclude() {
    return {
      users: {
        select: {
          id:
            true,

          first_name:
            true,

          last_name:
            true,

          email:
            true,

          phone:
            true,
        },
      },

      marketplace_listings: {
        include: {
          users_marketplace_listings_owner_user_idTousers: {
            select: {
              id:
                true,

              first_name:
                true,

              last_name:
                true,

              email:
                true,

              phone:
                true,
            },
          },

          marketplace_listing_media: {
            where: {
              media_kind:
                'IMAGE',
            },

            include: {
              media_assets:
                true,
            },

            orderBy: {
              display_order:
                'asc' as const,
            },

            take:
              1,
          },
        },
      },

      marketplace_deals:
        true,
    } satisfies
      Prisma.marketplace_offersInclude;
  }

  private formatListing(
    offer:
      Prisma.marketplace_offersGetPayload<{
        include:
          ReturnType<
            MarketplaceOffersService[
              'offerInclude'
            ]
          >;
      }>,
  ) {
    const listing =
      offer.marketplace_listings;

    const cover =
      listing.marketplace_listing_media[
        0
      ];

    return {
      id:
        listing.id,

      reference:
        listing.reference,

      slug:
        listing.slug,

      title:
        listing.title,

      brand:
        listing.brand,

      model:
        listing.model,

      registrationYear:
        listing.registration_year,

      requestedPrice:
        Number(
          listing.requested_price,
        ),

      status:
        listing.status,

      coverUrl:
        cover
          ? this.buildMediaUrl(
              cover.media_assets.object_key,
            )
          : null,
    };
  }

  private formatSentOffer(
    offer:
      Prisma.marketplace_offersGetPayload<{
        include:
          ReturnType<
            MarketplaceOffersService[
              'offerInclude'
            ]
          >;
      }>,
  ) {
    const accepted =
      offer.status ===
        'ACCEPTED' &&
      offer.marketplace_deals;

    return {
      id:
        offer.id,

      amount:
        Number(
          offer.amount,
        ),

      currencyCode:
        offer.currency_code,

      message:
        offer.message,

      status:
        offer.status,

      submittedAt:
        offer.submitted_at,

      respondedAt:
        offer.responded_at,

      cancelledAt:
        offer.cancelled_at,

      listing:
        this.formatListing(
          offer,
        ),

      sellerContact:
        accepted
          ? {
              firstName:
                accepted.seller_first_name,

              lastName:
                accepted.seller_last_name,

              email:
                accepted.seller_email,

              phone:
                accepted.seller_phone,
            }
          : null,
    };
  }

  private formatReceivedOffer(
    offer:
      Prisma.marketplace_offersGetPayload<{
        include:
          ReturnType<
            MarketplaceOffersService[
              'offerInclude'
            ]
          >;
      }>,
  ) {
    const accepted =
      offer.status ===
        'ACCEPTED' &&
      offer.marketplace_deals;

    return {
      id:
        offer.id,

      amount:
        Number(
          offer.amount,
        ),

      currencyCode:
        offer.currency_code,

      message:
        offer.message,

      status:
        offer.status,

      submittedAt:
        offer.submitted_at,

      respondedAt:
        offer.responded_at,

      cancelledAt:
        offer.cancelled_at,

      listing:
        this.formatListing(
          offer,
        ),

      buyer:
        accepted
          ? {
              firstName:
                accepted.buyer_first_name,

              lastName:
                accepted.buyer_last_name,

              email:
                accepted.buyer_email,

              phone:
                accepted.buyer_phone,
            }
          : {
              label:
                'Acheteur anonyme',
            },
    };
  }

private buildMediaUrl(
  objectKey:
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
        'MARKETPLACE_OFFER',

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