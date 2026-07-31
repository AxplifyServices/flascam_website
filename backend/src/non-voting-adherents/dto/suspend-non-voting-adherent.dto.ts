import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SuspendNonVotingAdherentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason!: string;
}