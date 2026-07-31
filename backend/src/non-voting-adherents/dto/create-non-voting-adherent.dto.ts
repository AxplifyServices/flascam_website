import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export const NON_VOTING_PAYMENT_METHODS = [
  'CARD',
  'WAFACASH',
] as const;

export type NonVotingPaymentMethod =
  (typeof NON_VOTING_PAYMENT_METHODS)[number];

export class CreateNonVotingAdherentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  city!: string;

  @IsIn(
    NON_VOTING_PAYMENT_METHODS,
  )
  depositPaymentMethod!:
    NonVotingPaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  wafacashReference?: string;

  /*
   * Facultatif.
   * Lorsqu’il n’est pas fourni,
   * le backend génère un mot de passe temporaire.
   */
  @IsOptional()
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  temporaryPassword?: string;
}