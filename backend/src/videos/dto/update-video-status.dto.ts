import {
  IsIn,
} from 'class-validator';

export const ADMIN_VIDEO_STATUSES = [
  'DRAFT',
  'PUBLISHED',
  'ARCHIVED',
] as const;

export class UpdateVideoStatusDto {
  @IsIn(ADMIN_VIDEO_STATUSES)
  status!: string;
}