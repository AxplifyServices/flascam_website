import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export const ADHERENT_IDENTIFIER_TYPES = [
  'ICE',
  'IF',
  'RC',
  'CIN',
  'OTHER',
] as const;

export type AdherentIdentifierType =
  (typeof ADHERENT_IDENTIFIER_TYPES)[number];

export class CreateAdherentDto {
  @IsOptional()
  @IsUUID()
  regionalAssociationId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  displayName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  legalName?: string;

  @IsOptional()
  @IsIn(ADHERENT_IDENTIFIER_TYPES)
  identifierType?: AdherentIdentifierType;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  identifierValue?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  postalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  /*
   * Seulement pris en compte pour SUPER_ADMIN et FLASCAM_ADMIN.
   * Une association ne peut jamais activer directement un adhérent.
   */
  @IsOptional()
  @IsBoolean()
  approveImmediately?: boolean;
}