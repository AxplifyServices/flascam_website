import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

import {
  MARKETPLACE_OFFER_STATUSES,
} from '../marketplace.constants';

export class MarketplaceOffersQueryDto {
  @IsOptional()
  @IsIn(
    MARKETPLACE_OFFER_STATUSES,
  )
  status?: string;

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
  @Max(50)
  limit = 20;
}