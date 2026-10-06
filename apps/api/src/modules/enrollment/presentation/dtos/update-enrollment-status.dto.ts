import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

/** Admin enrollment workflow targets (synced with student lifecycle). */
const ADMIN_ENROLLMENT_WORKFLOW_STATUSES = [
  EnrollmentStatus.JOINED,
  EnrollmentStatus.COMPLETED,
  EnrollmentStatus.CANCELLED,
  EnrollmentStatus.PLACED,
] as const;

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ enum: ADMIN_ENROLLMENT_WORKFLOW_STATUSES })
  @IsIn(ADMIN_ENROLLMENT_WORKFLOW_STATUSES)
  status!: EnrollmentStatus;
}
