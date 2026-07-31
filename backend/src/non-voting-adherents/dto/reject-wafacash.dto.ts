import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class RejectWafacashDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  reason!: string;
}