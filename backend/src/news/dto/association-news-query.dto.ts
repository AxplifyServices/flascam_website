import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

import {
  NEWS_CONTENT_TYPES,
} from './upsert-news-article.dto';

export class AssociationNewsQueryDto {
  @IsOptional()
  @IsIn(NEWS_CONTENT_TYPES)
  contentType?: string;

  @IsOptional()
  @IsIn([
    'DRAFT',
    'PENDING_REVIEW',
    'REJECTED',
    'PUBLISHED',
    'ARCHIVED',
  ])
  status?: string;

  @IsOptional()
  @IsString()
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