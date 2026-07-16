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
  NEWS_CONTENT_TYPES,
  NEWS_EVENT_CATEGORIES,
} from './upsert-news-article.dto';

export class PublicNewsQueryDto {
  @IsOptional()
  @IsIn(NEWS_CONTENT_TYPES)
  contentType?: string;

  @IsOptional()
  @IsIn(NEWS_EVENT_CATEGORIES)
  eventCategory?: string;

  @IsOptional()
  @IsIn([
    'UPCOMING',
    'ONGOING',
    'PAST',
  ])
  eventPeriod?: string;

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