import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const ADHERENT_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'SUSPENDED',
] as const;

export type AdherentStatus =
  (typeof ADHERENT_STATUSES)[number];

export class UpdateAdherentStatusDto {
  @IsIn(ADHERENT_STATUSES)
  status!: AdherentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}