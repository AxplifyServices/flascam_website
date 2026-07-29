import {
  Transform,
  Type,
} from 'class-transformer';

import {
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export type ContactRequesterType =
  | 'INDIVIDUAL'
  | 'PROFESSIONAL';

export class CreateContactMessageDto {
  @Transform(({ value }) =>
    String(value ?? '').trim(),
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName!: string;

  @Transform(({ value }) =>
    String(value ?? '').trim(),
  )
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName!: string;

  @Transform(({ value }) =>
    String(value ?? '').trim(),
  )
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  city!: string;

  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toLowerCase(),
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @Transform(({ value }) =>
    String(value ?? '').trim(),
  )
  @IsString()
  @MinLength(8)
  @MaxLength(30)
  @Matches(
    /^\+?[0-9][0-9\s().-]*$/,
    {
      message:
        'Le numéro de téléphone contient un format invalide.',
    },
  )
  phone!: string;

  @Transform(({ value }) =>
    String(value ?? '')
      .trim()
      .toUpperCase(),
  )
  @IsIn([
    'INDIVIDUAL',
    'PROFESSIONAL',
  ])
  requesterType!: ContactRequesterType;

  @Transform(({ value }) =>
    String(value ?? '').trim(),
  )
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description!: string;

  @IsOptional()
  @Transform(({ value }) => {
    const normalized =
      String(value ?? '').trim();

    return normalized || undefined;
  })
  @IsUUID()
  associationId?: string;

  @ValidateIf(
    (dto: CreateContactMessageDto) =>
      dto.requesterType ===
      'PROFESSIONAL',
  )
  @Transform(({ value }) =>
    String(value ?? '').trim(),
  )
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  companyName?: string;

  @ValidateIf(
    (dto: CreateContactMessageDto) =>
      dto.requesterType ===
      'PROFESSIONAL',
  )
  @Transform(({ value }) =>
    String(value ?? '').trim(),
  )
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  businessSector?: string;

  @ValidateIf(
    (dto: CreateContactMessageDto) =>
      dto.requesterType ===
      'PROFESSIONAL',
  )
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(200)
  yearsInBusiness?: number;
}