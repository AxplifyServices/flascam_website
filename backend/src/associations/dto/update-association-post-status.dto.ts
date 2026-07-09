import {
  IsIn,
} from 'class-validator';

export class UpdateAssociationPostStatusDto {
  @IsIn([
    'DRAFT',
    'SUBMITTED',
    'PUBLISHED',
    'ARCHIVED',
  ])
  status!: string;
}