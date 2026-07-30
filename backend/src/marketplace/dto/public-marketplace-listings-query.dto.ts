import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  MARKETPLACE_FUEL_TYPES,
  MARKETPLACE_TRANSMISSIONS,
  MARKETPLACE_VEHICLE_TYPES,
} from '../marketplace.constants';

export const MARKETPLACE_PUBLIC_SORTS = [
  'RECENT',
  'PRICE_ASC',
  'PRICE_DESC',
  'YEAR_DESC',
  'MILEAGE_ASC',
] as const;

export class PublicMarketplaceListingsQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsIn(
    MARKETPLACE_VEHICLE_TYPES,
  )
  vehicleType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  model?: string;

  @IsOptional()
  @IsIn(
    MARKETPLACE_FUEL_TYPES,
  )
  fuelType?: string;

  @IsOptional()
  @IsIn(
    MARKETPLACE_TRANSMISSIONS,
  )
  transmission?: string;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1900)
  @Max(2200)
  minimumYear?: number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1900)
  @Max(2200)
  maximumYear?: number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  minimumPrice?: number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsNumber({
    maxDecimalPlaces: 2,
  })
  @Min(0)
  maximumPrice?: number;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(0)
  maximumMileageKm?: number;

  @IsOptional()
  @IsIn(
    MARKETPLACE_PUBLIC_SORTS,
  )
  sort = 'RECENT';

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  page = 1;

  /*
   * 12 éléments offrent un affichage cohérent :
   * - mobile : une colonne ;
   * - tablette : deux colonnes ;
   * - desktop : trois ou quatre colonnes.
   */
  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(24)
  limit = 12;
}