import { IsISO8601, IsOptional } from 'class-validator';

export class EnrollmentNotificationsQueryDto {
  @IsOptional()
  @IsISO8601({}, { message: 'since must be a valid ISO-8601 date-time' })
  since?: string;
}
