import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class UpsertAssociationPostDto {
  @IsIn([
    'ACTUALITY',
    'EVENT',
  ])
  contentType!: string;

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
  @IsUUID()
  coverMediaAssetId?: string;

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
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;
}