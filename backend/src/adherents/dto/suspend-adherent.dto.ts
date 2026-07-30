import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SuspendAdherentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason!: string;
}