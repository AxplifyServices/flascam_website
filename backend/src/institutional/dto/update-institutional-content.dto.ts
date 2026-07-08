import {
  Type,
} from 'class-transformer';

import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class MissionItemDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  description!: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsBoolean()
  isPublished!: boolean;
}

export class KeyFigureItemDto {
  @IsString()
  @MaxLength(80)
  value!: string;

  @IsString()
  @MaxLength(180)
  label!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsBoolean()
  isPublished!: boolean;
}

export class ExecutiveMemberItemDto {
  @IsString()
  @MaxLength(180)
  fullName!: string;

  @IsString()
  @MaxLength(180)
  position!: string;

  @IsOptional()
  @IsString()
  biography?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsBoolean()
  isPublished!: boolean;
}

export class PartnerItemDto {
  @IsString()
  @MaxLength(180)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  websiteUrl?: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsBoolean()
  isPublished!: boolean;
}

export class InstitutionalDocumentItemDto {
  @IsString()
  @MaxLength(255)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  documentType?: string;

  @IsString()
  fileUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  fileSizeLabel?: string;

  @IsOptional()
  @IsString()
  publicationDate?: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsBoolean()
  isPublished!: boolean;
}

export class UpdateInstitutionalContentDto {
  @IsString()
  @MaxLength(100)
  slug!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  heroEyebrow?: string;

  @IsString()
  @MaxLength(255)
  heroTitle!: string;

  @IsOptional()
  @IsString()
  heroSubtitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  heroPrimaryCtaLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  heroPrimaryCtaUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  heroSecondaryCtaLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  heroSecondaryCtaUrl?: string;

  @IsOptional()
  @IsString()
  federationEyebrow?: string;

  @IsOptional()
  @IsString()
  federationTitle?: string;

  @IsOptional()
  @IsString()
  federationBody?: string;

  @IsOptional()
  @IsString()
  missionsEyebrow?: string;

  @IsOptional()
  @IsString()
  missionsTitle?: string;

  @IsOptional()
  @IsString()
  missionsBody?: string;

  @IsOptional()
  @IsString()
  governanceEyebrow?: string;

  @IsOptional()
  @IsString()
  governanceTitle?: string;

  @IsOptional()
  @IsString()
  governanceBody?: string;

  @IsOptional()
  @IsString()
  executiveOfficeEyebrow?: string;

  @IsOptional()
  @IsString()
  executiveOfficeTitle?: string;

  @IsOptional()
  @IsString()
  executiveOfficeBody?: string;

  @IsOptional()
  @IsString()
  partnersEyebrow?: string;

  @IsOptional()
  @IsString()
  partnersTitle?: string;

  @IsOptional()
  @IsString()
  partnersBody?: string;

  @IsOptional()
  @IsString()
  documentsEyebrow?: string;

  @IsOptional()
  @IsString()
  documentsTitle?: string;

  @IsOptional()
  @IsString()
  documentsBody?: string;

  @IsOptional()
  @IsString()
  contactEyebrow?: string;

  @IsOptional()
  @IsString()
  contactTitle?: string;

  @IsOptional()
  @IsString()
  contactBody?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactAddress?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  seoDescription?: string;

  @IsBoolean()
  isPublished!: boolean;

  @ValidateNested({
    each: true,
  })
  @Type(() => MissionItemDto)
  missions!: MissionItemDto[];

  @ValidateNested({
    each: true,
  })
  @Type(() => KeyFigureItemDto)
  keyFigures!: KeyFigureItemDto[];

  @ValidateNested({
    each: true,
  })
  @Type(() => ExecutiveMemberItemDto)
  executiveMembers!: ExecutiveMemberItemDto[];

  @ValidateNested({
    each: true,
  })
  @Type(() => PartnerItemDto)
  partners!: PartnerItemDto[];

  @ValidateNested({
    each: true,
  })
  @Type(
    () =>
      InstitutionalDocumentItemDto,
  )
  documents!: InstitutionalDocumentItemDto[];
}