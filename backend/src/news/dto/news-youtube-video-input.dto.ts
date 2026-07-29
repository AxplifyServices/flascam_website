import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class NewsYoutubeVideoInputDto {
  @IsString()
  @MaxLength(2_000)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1_000)
  description?: string;

  @IsInt()
  @Min(0)
  displayOrder!: number;
}