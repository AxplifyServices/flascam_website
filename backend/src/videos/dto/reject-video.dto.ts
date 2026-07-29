import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RejectVideoDto {
  @IsString()
  @MinLength(5)
  @MaxLength(1_000)
  reason!: string;
}