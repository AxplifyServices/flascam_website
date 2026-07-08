import {
  IsIn,
} from 'class-validator';

export class UpdateContactStatusDto {
  @IsIn([
    'NEW',
    'IN_PROGRESS',
    'PROCESSED',
    'ARCHIVED',
  ])
  status!:
    | 'NEW'
    | 'IN_PROGRESS'
    | 'PROCESSED'
    | 'ARCHIVED';
}