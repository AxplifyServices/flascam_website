import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export const associationLeaderRoles = [
  'PRESIDENT',
  'SECRETARY_GENERAL',
] as const;

export type AssociationLeaderRole =
  (typeof associationLeaderRoles)[number];

export class AssociationLeaderInputDto {
  @IsIn(associationLeaderRoles)
  role!: AssociationLeaderRole;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  fullName?: string;

  @IsOptional()
  @IsUUID()
  photoMediaAssetId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  biography?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  message?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}