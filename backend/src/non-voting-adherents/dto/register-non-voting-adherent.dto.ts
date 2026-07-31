import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  NON_VOTING_PAYMENT_METHODS,
  type NonVotingPaymentMethod,
} from './create-non-voting-adherent.dto';

export class RegisterNonVotingAdherentDto {
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

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;

  @IsIn(
    NON_VOTING_PAYMENT_METHODS,
  )
  depositPaymentMethod!:
    NonVotingPaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  wafacashReference?: string;
}