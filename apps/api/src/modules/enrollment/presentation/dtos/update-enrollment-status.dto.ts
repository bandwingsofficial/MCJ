import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ enum: EnrollmentStatus })
  @IsEnum(EnrollmentStatus)
  status!: EnrollmentStatus;
}
