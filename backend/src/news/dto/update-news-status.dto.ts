import {
  IsIn,
} from 'class-validator';

export class UpdateNewsStatusDto {
  @IsIn([
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED',
  ])
  status!: string;
}