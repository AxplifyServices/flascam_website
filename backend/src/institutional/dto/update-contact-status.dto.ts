import {
  IsIn,
} from 'class-validator';

export const CONTACT_MESSAGE_STATUSES = [
  'NEW',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;

export type ContactMessageStatus =
  (typeof CONTACT_MESSAGE_STATUSES)[number];

export class UpdateContactStatusDto {
  @IsIn(
    CONTACT_MESSAGE_STATUSES,
  )
  status!: ContactMessageStatus;
}