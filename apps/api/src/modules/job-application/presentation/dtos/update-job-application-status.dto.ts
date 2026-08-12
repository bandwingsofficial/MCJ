import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';

export class UpdateJobApplicationStatusDto {
  @ApiProperty({ enum: JobApplicationStatus })
  @IsEnum(JobApplicationStatus)
  status!: JobApplicationStatus;
}
