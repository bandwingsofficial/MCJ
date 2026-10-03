import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

const ADMIN_ENROLLMENT_STATUSES = [
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.COMPLETED,
] as const;

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ enum: ADMIN_ENROLLMENT_STATUSES })
  @IsIn(ADMIN_ENROLLMENT_STATUSES)
  status!: EnrollmentStatus;
}
