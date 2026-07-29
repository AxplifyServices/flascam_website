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
  VIDEO_STATUSES,
} from './admin-videos-query.dto';

import {
  VIDEO_PROVIDERS,
} from './upsert-video.dto';

export class AssociationVideosQueryDto {
  @IsOptional()
  @IsIn(VIDEO_STATUSES)
  status?: string;

  @IsOptional()
  @IsIn(VIDEO_PROVIDERS)
  provider?: string;

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