import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  ADHERENT_IDENTIFIER_TYPES,
  type AdherentIdentifierType,
} from './create-adherent.dto';

export class UpdateAdherentDto {
  /*
   * Modifiable uniquement par FLASCAM.
   */
  @IsOptional()
  @IsUUID()
  regionalAssociationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

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

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;
}