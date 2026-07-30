import {
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import {
  MARKETPLACE_CURRENCY,
  MARKETPLACE_FUEL_TYPES,
  MARKETPLACE_MAX_DURATION_DAYS,
  MARKETPLACE_MAX_IMAGES,
  MARKETPLACE_MIN_DURATION_DAYS,
  MARKETPLACE_TRANSMISSIONS,
  MARKETPLACE_VEHICLE_TYPES,
} from '../marketplace.constants';

import {
  MarketplaceListingMediaInputDto,
} from './marketplace-listing-media-input.dto';

const CURRENT_YEAR =
  new Date().getFullYear();

export class UpsertMarketplaceListingDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  description?: string;

  @IsIn(
    MARKETPLACE_VEHICLE_TYPES,
  )
  vehicleType!: string;

  @IsString()
  @MaxLength(120)
  brand!: string;

  @IsString()
  @MaxLength(160)
  model!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  version?: string;

  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1900)
  @Max(
    CURRENT_YEAR + 1,
  )
  registrationYear!: number;

  @IsOptional()
  @IsDateString()
  firstRegistrationDate?: string;

  @Type(
    () => Number,
  )
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  mileageKm!: number;

  @IsIn(
    MARKETPLACE_FUEL_TYPES,
  )
  fuelType!: string;

  @IsIn(
    MARKETPLACE_TRANSMISSIONS,
  )
  transmission!: string;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  fiscalPower?: number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(5_000)
  enginePowerHp?: number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(50_000)
  engineCapacityCc?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  bodyType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  exteriorColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  interiorColor?: string;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(20)
  doorsCount?: number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  seatsCount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  registrationCity?: string;

  @Type(
    () => Number,
  )
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(1)
  @Max(1_000_000_000)
  requestedPrice!: number;

  /*
   * La marketplace est actuellement limitée au dirham.
   * Le champ est conservé pour éviter une refonte future
   * si plusieurs devises sont ajoutées.
   */
  @IsOptional()
  @IsIn([
    MARKETPLACE_CURRENCY,
  ])
  currencyCode =
    MARKETPLACE_CURRENCY;

  @Type(
    () => Number,
  )
  @IsInt()
  @Min(
    MARKETPLACE_MIN_DURATION_DAYS,
  )
  @Max(
    MARKETPLACE_MAX_DURATION_DAYS,
  )
  durationDays!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  /*
   * La limite SQL porte sur une vidéo.
   * La limite de 12 éléments permet actuellement :
   * - 12 images ;
   * - ou 11 images et 1 vidéo.
   *
   * Le service effectuera une validation plus précise
   * du nombre d’images et de vidéos.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(
    MARKETPLACE_MAX_IMAGES,
  )
  @ValidateNested({
    each: true,
  })
  @Type(
    () =>
      MarketplaceListingMediaInputDto,
  )
  media: MarketplaceListingMediaInputDto[] =
    [];
}