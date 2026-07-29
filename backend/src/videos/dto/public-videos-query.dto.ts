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
  VIDEO_PROVIDERS,
} from './upsert-video.dto';

export class PublicVideosQueryDto {
  @IsOptional()
  @IsIn(VIDEO_PROVIDERS)
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  associationSlug?: string;

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
  @Max(24)
  limit = 12;
}