import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateHomepageHeroSlideDto {
  @IsUUID()
  mediaAssetId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  title?: string;

  @IsString()
  @MaxLength(255)
  altText!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}