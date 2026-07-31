import {
  Type,
} from 'class-transformer';

import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const NON_VOTING_MEMBERSHIP_STATUSES = [
  'PENDING_PAYMENT',
  'PENDING_REVIEW',
  'ACTIVE',
  'REJECTED',
  'SUSPENDED',
] as const;

export type NonVotingMembershipStatus =
  (typeof NON_VOTING_MEMBERSHIP_STATUSES)[number];

export class NonVotingAdherentsQueryDto {
  @IsOptional()
  @IsIn(
    NON_VOTING_MEMBERSHIP_STATUSES,
  )
  status?:
    NonVotingMembershipStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(
    () => Number,
  )
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}