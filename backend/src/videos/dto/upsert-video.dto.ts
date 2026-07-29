import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export const VIDEO_PROVIDERS = [
  'YOUTUBE',
  'UPLOADED',
] as const;

export class UpsertVideoDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(180)
  slug!: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(VIDEO_PROVIDERS)
  provider!: string;

  /*
   * Obligatoire pour une vidéo YouTube.
   */
  @ValidateIf(
    (dto: UpsertVideoDto) =>
      dto.provider === 'YOUTUBE',
  )
  @IsString()
  @MaxLength(2_000)
  externalUrl?: string;

  /*
   * Obligatoire pour une vidéo importée.
   */
  @ValidateIf(
    (dto: UpsertVideoDto) =>
      dto.provider === 'UPLOADED',
  )
  @IsUUID()
  mediaAssetId?: string;

  @IsOptional()
  @IsUUID()
  thumbnailMediaAssetId?: string;

  /*
   * Ce champ n’est utilisable que par la FLASCAM.
   * Il permet de publier une vidéo pour une association
   * depuis l’interface centrale.
   */
  @IsOptional()
  @IsUUID()
  regionalAssociationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  displayOrder = 0;

  @IsOptional()
  @Transform(
    ({ value }) =>
      value === true ||
      value === 'true',
  )
  @IsBoolean()
  isFeatured = false;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;
}