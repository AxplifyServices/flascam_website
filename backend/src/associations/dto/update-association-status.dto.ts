import {
  IsIn,
} from 'class-validator';

export class UpdateAssociationStatusDto {
  @IsIn([
    'DRAFT',
    'SUBMITTED',
    'PUBLISHED',
    'ARCHIVED',
  ])
  status!: string;
}