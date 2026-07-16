import {
  IsDateString,
} from 'class-validator';

export class ScheduleNewsPublicationDto {
  @IsDateString()
  scheduledAt!: string;
}