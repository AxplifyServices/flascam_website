import {
  IsDateString,
} from 'class-validator';

export class ScheduleVideoDto {
  @IsDateString()
  scheduledAt!: string;
}