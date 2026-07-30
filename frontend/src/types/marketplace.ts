export type MarketplaceSellerType =
  | 'FLASCAM'
  | 'ASSOCIATION'
  | 'ADHERENT';

export type MarketplaceListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'WITHDRAWN'
  | 'EXPIRED'
  | 'SOLD';

export type MarketplaceVehicleType =
  | 'CAR'
  | 'UTILITY'
  | 'TRUCK'
  | 'MINIBUS'
  | 'OTHER';

export type MarketplaceFuelType =
  | 'DIESEL'
  | 'PETROL'
  | 'HYBRID'
  | 'PLUG_IN_HYBRID'
  | 'ELECTRIC'
  | 'LPG'
  | 'OTHER';

export type MarketplaceTransmission =
  | 'MANUAL'
  | 'AUTOMATIC'
  | 'SEMI_AUTOMATIC';

export type MarketplaceMediaKind =
  | 'IMAGE'
  | 'VIDEO';

export type MarketplaceListingMedia = {
  id: string;
  mediaAssetId: string;
  mediaKind: MarketplaceMediaKind;
  displayOrder: number;

  altText?: string | null;
  caption?: string | null;

  url: string;
  mimeType: string;

  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;

  originalFilename: string;
};

export type MarketplaceListing = {
  id: string;
  reference: string;
  slug: string;

  sellerType: MarketplaceSellerType;
  status: MarketplaceListingStatus;

  title: string;
  description?: string | null;

  vehicleType: MarketplaceVehicleType;

  brand: string;
  model: string;
  version?: string | null;

  registrationYear: number;
  firstRegistrationDate?: string | null;

  mileageKm: number;

  fuelType: MarketplaceFuelType;
  transmission: MarketplaceTransmission;

  fiscalPower?: number | null;
  enginePowerHp?: number | null;
  engineCapacityCc?: number | null;

  bodyType?: string | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;

  doorsCount?: number | null;
  seatsCount?: number | null;

  registrationCity?: string | null;

  requestedPrice: number;
  currencyCode: 'MAD';

  durationDays: number;

  submittedAt?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;

  publishedAt?: string | null;
  expiresAt?: string | null;
  soldAt?: string | null;
  withdrawnAt?: string | null;

  remainingDays?: number | null;

  seoTitle?: string | null;
  seoDescription?: string | null;

  media: MarketplaceListingMedia[];

  offersCount: number;

  createdAt: string;
  updatedAt: string;
};

export type MarketplacePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type MarketplaceListingListResponse = {
  items: MarketplaceListing[];
  pagination: MarketplacePagination;
};

export type MyMarketplaceListingFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: MarketplaceListingStatus | '';
};

export type MarketplaceListingMediaInput = {
  mediaAssetId: string;
  mediaKind: MarketplaceMediaKind;
  displayOrder: number;
  altText?: string;
  caption?: string;
};

export type MarketplaceListingPayload = {
  title: string;
  description?: string;

  vehicleType: MarketplaceVehicleType;

  brand: string;
  model: string;
  version?: string;

  registrationYear: number;
  firstRegistrationDate?: string;

  mileageKm: number;

  fuelType: MarketplaceFuelType;
  transmission: MarketplaceTransmission;

  fiscalPower?: number;
  enginePowerHp?: number;
  engineCapacityCc?: number;

  bodyType?: string;
  exteriorColor?: string;
  interiorColor?: string;

  doorsCount?: number;
  seatsCount?: number;

  registrationCity?: string;

  requestedPrice: number;
  currencyCode: 'MAD';

  durationDays: number;

  seoTitle?: string;
  seoDescription?: string;

  media: MarketplaceListingMediaInput[];
};

export type UploadedMarketplaceMedia = {
  id: string;
  mediaAssetId: string;

  url: string;

  mediaType:
    | 'IMAGE'
    | 'VIDEO';

  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
};

export const MARKETPLACE_STATUS_LABELS:
  Record<
    MarketplaceListingStatus,
    string
  > = {
    DRAFT:
      'Brouillon',

    PENDING_REVIEW:
      'En attente de validation',

    PUBLISHED:
      'Publiée',

    REJECTED:
      'Refusée',

    WITHDRAWN:
      'Retirée',

    EXPIRED:
      'Expirée',

    SOLD:
      'Offre acceptée',
  };

export const MARKETPLACE_VEHICLE_TYPE_LABELS:
  Record<
    MarketplaceVehicleType,
    string
  > = {
    CAR:
      'Voiture',

    UTILITY:
      'Véhicule utilitaire',

    TRUCK:
      'Camion',

    MINIBUS:
      'Minibus',

    OTHER:
      'Autre véhicule',
  };

export const MARKETPLACE_FUEL_LABELS:
  Record<
    MarketplaceFuelType,
    string
  > = {
    DIESEL:
      'Diesel',

    PETROL:
      'Essence',

    HYBRID:
      'Hybride',

    PLUG_IN_HYBRID:
      'Hybride rechargeable',

    ELECTRIC:
      'Électrique',

    LPG:
      'GPL',

    OTHER:
      'Autre',
  };

export const MARKETPLACE_TRANSMISSION_LABELS:
  Record<
    MarketplaceTransmission,
    string
  > = {
    MANUAL:
      'Manuelle',

    AUTOMATIC:
      'Automatique',

    SEMI_AUTOMATIC:
      'Semi-automatique',
  };