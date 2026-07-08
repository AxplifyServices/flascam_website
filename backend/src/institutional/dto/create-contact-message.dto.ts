import {
  Transform,
} from 'class-transformer';

import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateContactMessageDto {
  @Transform(({ value }) =>
    String(value).trim(),
  )
  @IsString()
  @MinLength(2)
  @MaxLength(180)
  fullName!: string;

  @Transform(({ value }) =>
    String(value)
      .trim()
      .toLowerCase(),
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @Transform(({ value }) =>
    value
      ? String(value).trim()
      : undefined,
  )
  @IsString()
  @MaxLength(50)
  phone?: string;

  @Transform(({ value }) =>
    String(value).trim(),
  )
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  subject!: string;

  @Transform(({ value }) =>
    String(value).trim(),
  )
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  message!: string;
}