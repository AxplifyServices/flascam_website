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
  VIDEO_PROVIDERS,
} from './upsert-video.dto';

export const VIDEO_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'REJECTED',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export const VIDEO_SOURCE_TYPES = [
  'STANDALONE',
  'NEWS',
] as const;

export class AdminVideosQueryDto {
  @IsOptional()
  @IsIn(VIDEO_STATUSES)
  status?: string;

  @IsOptional()
  @IsIn(VIDEO_PROVIDERS)
  provider?: string;

  @IsOptional()
  @IsIn(VIDEO_SOURCE_TYPES)
  sourceType?: string;

  @IsOptional()
  @IsUUID()
  regionalAssociationId?: string;

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