import {
  Type,
} from 'class-transformer';

import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMarketplaceOfferDto {
  @Type(
    () => Number,
  )
  @IsNumber({
    maxDecimalPlaces:
      2,
  })
  @Min(1)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2_000)
  message?: string;
}