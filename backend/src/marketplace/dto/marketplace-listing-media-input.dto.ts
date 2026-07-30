import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import {
  MARKETPLACE_MEDIA_KINDS,
} from '../marketplace.constants';

export class MarketplaceListingMediaInputDto {
  @IsUUID()
  mediaAssetId!: string;

  @IsIn(
    MARKETPLACE_MEDIA_KINDS,
  )
  mediaKind!: string;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(0)
  @Max(100)
  displayOrder = 0;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1_000)
  caption?: string;
}