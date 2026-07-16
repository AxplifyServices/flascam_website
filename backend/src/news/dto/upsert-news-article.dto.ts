import {
  Type,
} from 'class-transformer';

import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

import {
  NewsMediaInputDto,
} from './news-media-input.dto';

export const NEWS_CONTENT_TYPES = [
  'ACTUALITY',
  'EVENT',
  'OFFICIAL_RELEASE',
  'REGULATORY_PUBLICATION',
  'PRESS_REVIEW',
] as const;

export const NEWS_EVENT_CATEGORIES = [
  'SALON_EXPOSITION',
  'CONFERENCE_SOMMET',
  'ASSEMBLEE_INSTITUTIONNELLE',
  'PRESSE_MEDIA',
  'PRIX_CONCOURS',
  'PARTENARIAT',
  'RENCONTRE_INSTITUTIONNELLE',
  'LANCEMENT_AUTOMOBILE',
  'FORMATION_ATELIER',
  'OTHER',
] as const;

export class UpsertNewsArticleDto {
  @IsIn(NEWS_CONTENT_TYPES)
  contentType!: string;

  @IsOptional()
  @IsIn(NEWS_EVENT_CATEGORIES)
  eventCategory?: string;

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
  body?: string;

  @IsOptional()
  @IsDateString()
  eventStartAt?: string;

  @IsOptional()
  @IsDateString()
  eventEndAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  eventLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({
    each: true,
  })
  @Type(
    () => NewsMediaInputDto,
  )
  media?: NewsMediaInputDto[];
}