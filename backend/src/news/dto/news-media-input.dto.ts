import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class NewsMediaInputDto {
  @IsUUID()
  mediaAssetId!: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  altText?: string;

  @IsOptional()
  @IsString()
  caption?: string;
}