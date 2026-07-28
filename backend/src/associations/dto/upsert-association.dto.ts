import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsArray,
ValidateNested,
ArrayMaxSize,
} from 'class-validator';

import {
  Type,
} from 'class-transformer';

import {
  AssociationLeaderInputDto,
} from './association-leader-input.dto';

export class UpsertAssociationDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @MaxLength(180)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  acronym?: string;

  @IsString()
  @MaxLength(180)
  region!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  city?: string;

@IsOptional()
@IsNumber(
  {
    maxDecimalPlaces: 6,
  },
  {
    message:
      'La latitude doit être un nombre valide.',
  },
)
@Min(-90)
@Max(90)
latitude?: number;

@IsOptional()
@IsNumber(
  {
    maxDecimalPlaces: 6,
  },
  {
    message:
      'La longitude doit être un nombre valide.',
  },
)
@Min(-180)
@Max(180)
longitude?: number;

  @IsOptional()
  @IsBoolean()
  mapIsVisible?: boolean;  

  @IsOptional()
  @IsInt()
  @Min(0)
  memberCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1900)
  affiliatedSinceYear?: number;

  @IsOptional()
  @IsUUID()
  logoMediaAssetId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  logoText?: string;

  @IsOptional()
  @IsString()
  presentation?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: false,
  })
  websiteUrl?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: false,
  })
  facebookUrl?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: false,
  })
  instagramUrl?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: false,
  })
  linkedinUrl?: string;

  @IsOptional()
  @IsUrl({
    require_protocol: false,
  })
  youtubeUrl?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

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

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  adminEmail?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2)
  @ValidateNested({
    each: true,
  })
  @Type(
    () =>
      AssociationLeaderInputDto,
  )
  leaders?: AssociationLeaderInputDto[];  

  @IsOptional()
  @IsString()
  @MaxLength(100)
  adminFirstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  adminLastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  adminPassword?: string;
}