import {
  Body,
  Controller,
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
  AdminMarketplaceListingsQueryDto,
} from './dto/admin-marketplace-listings-query.dto';

import {
  MyMarketplaceListingsQueryDto,
} from './dto/my-marketplace-listings-query.dto';

import {
  PublicMarketplaceListingsQueryDto,
} from './dto/public-marketplace-listings-query.dto';

import {
  RejectMarketplaceListingDto,
} from './dto/reject-marketplace-listing.dto';

import {
  UpsertMarketplaceListingDto,
} from './dto/upsert-marketplace-listing.dto';

import {
  MarketplaceService,
} from './marketplace.service';

import {
  CreateMarketplaceOfferDto,
} from './dto/create-marketplace-offer.dto';

import {
  MarketplaceOffersQueryDto,
} from './dto/marketplace-offers-query.dto';

import {
  MarketplaceOffersService,
} from './marketplace-offers.service';

@Controller('marketplace')
export class MarketplaceController {
constructor(
  private readonly service:
    MarketplaceService,

  private readonly offersService:
    MarketplaceOffersService,
) {}

  /*
   * ==========================================================
   * ROUTES PUBLIQUES
   * ==========================================================
   */

  @Public()
  @Get('public')
  getPublicListings(
    @Query()
    query:
      PublicMarketplaceListingsQueryDto,
  ) {
    return this.service
      .getPublicListings(
        query,
      );
  }

  @Public()
  @Get('public/:slug')
  getPublicListingBySlug(
    @Param('slug')
    slug:
      string,
  ) {
    return this.service
      .getPublicListingBySlug(
        slug,
      );
  }

  /*
   * ==========================================================
   * ANNONCES DU VENDEUR CONNECTÉ
   * ==========================================================
   */

  @Get('my-listings')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
    'ADHERENT',
  )
  @Permissions(
    'marketplace.listings.create',
  )
  getMyListings(
    @Query()
    query:
      MyMarketplaceListingsQueryDto,

    @CurrentUser()
    user:
      AuthUser,
  ) {
    return this.service
      .getMyListings(
        query,
        user,
      );
  }

  @Get('my-listings/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
    'ADHERENT',
  )
  @Permissions(
    'marketplace.listings.create',
  )
  getMyListingById(
    @Param('id')
    id:
      string,

    @CurrentUser()
    user:
      AuthUser,
  ) {
    return this.service
      .getMyListingById(
        id,
        user,
      );
  }

  @Post('my-listings')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
    'ADHERENT',
  )
  @Permissions(
    'marketplace.listings.create',
  )
  createListing(
    @Body()
    dto:
      UpsertMarketplaceListingDto,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service
      .createListing(
        dto,
        user,
        request,
      );
  }

  @Put('my-listings/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
    'ADHERENT',
  )
  @Permissions(
    'marketplace.listings.create',
  )
  updateListing(
    @Param('id')
    id:
      string,

    @Body()
    dto:
      UpsertMarketplaceListingDto,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service
      .updateListing(
        id,
        dto,
        user,
        request,
      );
  }

  @Patch(
    'my-listings/:id/submit',
  )
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
    'ADHERENT',
  )
  @Permissions(
    'marketplace.listings.create',
  )
  submitListing(
    @Param('id')
    id:
      string,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service
      .submitListing(
        id,
        user,
        request,
      );
  }

  @Patch(
    'my-listings/:id/withdraw',
  )
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
    'ADHERENT',
  )
  @Permissions(
    'marketplace.listings.create',
  )
  withdrawListing(
    @Param('id')
    id:
      string,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service
      .withdrawListing(
        id,
        user,
        request,
      );
  }

/*
 * ==========================================================
 * OFFRES MARKETPLACE
 * ==========================================================
 */

@Post(
  'listings/:listingId/offers',
)
@Roles(
  'SUPER_ADMIN',
  'FLASCAM_ADMIN',
  'ASSOCIATION_ADMIN',
  'ADHERENT',
  'MARKETPLACE_USER',
)
@Permissions(
  'marketplace.offers.create',
)
createOffer(
  @Param('listingId')
  listingId:
    string,

  @Body()
  dto:
    CreateMarketplaceOfferDto,

  @CurrentUser()
  user:
    AuthUser,

  @Req()
  request:
    Request,
) {
  return this.offersService
    .createOffer(
      listingId,
      dto,
      user,
      request,
    );
}

@Get(
  'my-offers/sent',
)
@Roles(
  'SUPER_ADMIN',
  'FLASCAM_ADMIN',
  'ASSOCIATION_ADMIN',
  'ADHERENT',
  'MARKETPLACE_USER',
)
@Permissions(
  'marketplace.offers.manage',
)
getSentOffers(
  @Query()
  query:
    MarketplaceOffersQueryDto,

  @CurrentUser()
  user:
    AuthUser,
) {
  return this.offersService
    .getSentOffers(
      query,
      user,
    );
}

@Get(
  'my-offers/received',
)
@Roles(
  'SUPER_ADMIN',
  'FLASCAM_ADMIN',
  'ASSOCIATION_ADMIN',
  'ADHERENT',
)
@Permissions(
  'marketplace.offers.manage',
)
getReceivedOffers(
  @Query()
  query:
    MarketplaceOffersQueryDto,

  @CurrentUser()
  user:
    AuthUser,
) {
  return this.offersService
    .getReceivedOffers(
      query,
      user,
    );
}

@Patch(
  'my-offers/:id/cancel',
)
@Roles(
  'SUPER_ADMIN',
  'FLASCAM_ADMIN',
  'ASSOCIATION_ADMIN',
  'ADHERENT',
  'MARKETPLACE_USER',
)
@Permissions(
  'marketplace.offers.manage',
)
cancelOffer(
  @Param('id')
  id:
    string,

  @CurrentUser()
  user:
    AuthUser,

  @Req()
  request:
    Request,
) {
  return this.offersService
    .cancelOffer(
      id,
      user,
      request,
    );
}

@Patch(
  'my-offers/:id/reject',
)
@Roles(
  'SUPER_ADMIN',
  'FLASCAM_ADMIN',
  'ASSOCIATION_ADMIN',
  'ADHERENT',
)
@Permissions(
  'marketplace.offers.manage',
)
rejectOffer(
  @Param('id')
  id:
    string,

  @CurrentUser()
  user:
    AuthUser,

  @Req()
  request:
    Request,
) {
  return this.offersService
    .rejectOffer(
      id,
      user,
      request,
    );
}

@Patch(
  'my-offers/:id/accept',
)
@Roles(
  'SUPER_ADMIN',
  'FLASCAM_ADMIN',
  'ASSOCIATION_ADMIN',
  'ADHERENT',
)
@Permissions(
  'marketplace.offers.manage',
)
acceptOffer(
  @Param('id')
  id:
    string,

  @CurrentUser()
  user:
    AuthUser,

  @Req()
  request:
    Request,
) {
  return this.offersService
    .acceptOffer(
      id,
      user,
      request,
    );
}  

  /*
   * ==========================================================
   * VALIDATION FLASCAM
   * ==========================================================
   */

  @Get('admin/listings')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'marketplace.listings.review',
  )
  getAdminListings(
    @Query()
    query:
      AdminMarketplaceListingsQueryDto,
  ) {
    return this.service
      .getAdminListings(
        query,
      );
  }

  @Get('admin/listings/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'marketplace.listings.review',
  )
  getAdminListingById(
    @Param('id')
    id:
      string,
  ) {
    return this.service
      .getAdminListingById(
        id,
      );
  }

  @Patch(
    'admin/listings/:id/approve',
  )
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'marketplace.listings.review',
  )
  approveListing(
    @Param('id')
    id:
      string,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service
      .approveListing(
        id,
        user,
        request,
      );
  }

  @Patch(
    'admin/listings/:id/reject',
  )
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'marketplace.listings.review',
  )
  rejectListing(
    @Param('id')
    id:
      string,

    @Body()
    dto:
      RejectMarketplaceListingDto,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service
      .rejectListing(
        id,
        dto.reason,
        user,
        request,
      );
  }
}