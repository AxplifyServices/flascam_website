import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateHomepageHeroSlideDto {
  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  desktopPositionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  desktopPositionY?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  mobilePositionX?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  mobilePositionY?: number;
}