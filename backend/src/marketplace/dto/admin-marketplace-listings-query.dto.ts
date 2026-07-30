import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  MARKETPLACE_LISTING_STATUSES,
  MARKETPLACE_SELLER_TYPES,
} from '../marketplace.constants';

export class AdminMarketplaceListingsQueryDto {
  @IsOptional()
  @IsIn(
    MARKETPLACE_LISTING_STATUSES,
  )
  status?: string;

  @IsOptional()
  @IsIn(
    MARKETPLACE_SELLER_TYPES,
  )
  sellerType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}