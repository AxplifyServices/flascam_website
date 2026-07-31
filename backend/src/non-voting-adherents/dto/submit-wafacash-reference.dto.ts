import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class SubmitWafacashReferenceDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  wafacashReference!: string;
}