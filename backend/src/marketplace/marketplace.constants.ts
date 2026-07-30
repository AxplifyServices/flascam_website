export const MARKETPLACE_SELLER_TYPES = [
  'FLASCAM',
  'ASSOCIATION',
  'ADHERENT',
] as const;

export type MarketplaceSellerType =
  (typeof MARKETPLACE_SELLER_TYPES)[number];

export const MARKETPLACE_LISTING_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'REJECTED',
  'WITHDRAWN',
  'EXPIRED',
  'SOLD',
] as const;

export type MarketplaceListingStatus =
  (typeof MARKETPLACE_LISTING_STATUSES)[number];

export const MARKETPLACE_VEHICLE_TYPES = [
  'CAR',
  'UTILITY',
  'TRUCK',
  'MINIBUS',
  'OTHER',
] as const;

export type MarketplaceVehicleType =
  (typeof MARKETPLACE_VEHICLE_TYPES)[number];

export const MARKETPLACE_FUEL_TYPES = [
  'DIESEL',
  'PETROL',
  'HYBRID',
  'PLUG_IN_HYBRID',
  'ELECTRIC',
  'LPG',
  'OTHER',
] as const;

export type MarketplaceFuelType =
  (typeof MARKETPLACE_FUEL_TYPES)[number];

export const MARKETPLACE_TRANSMISSIONS = [
  'MANUAL',
  'AUTOMATIC',
  'SEMI_AUTOMATIC',
] as const;

export type MarketplaceTransmission =
  (typeof MARKETPLACE_TRANSMISSIONS)[number];

export const MARKETPLACE_MEDIA_KINDS = [
  'IMAGE',
  'VIDEO',
] as const;

export type MarketplaceMediaKind =
  (typeof MARKETPLACE_MEDIA_KINDS)[number];

export const MARKETPLACE_CURRENCY = 'MAD';

export const MARKETPLACE_MIN_DURATION_DAYS = 1;

export const MARKETPLACE_MAX_DURATION_DAYS = 30;

export const MARKETPLACE_MAX_IMAGES = 12;

export const MARKETPLACE_MAX_VIDEOS = 1;