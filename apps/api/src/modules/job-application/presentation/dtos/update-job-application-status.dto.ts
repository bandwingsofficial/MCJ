import {
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';

export class UpdateJobApplicationStatusDto {
  @ApiProperty({ enum: JobApplicationStatus })
  @IsEnum(JobApplicationStatus)
  status!: JobApplicationStatus;

  @ApiPropertyOptional({
    description: 'Required when status is REJECTED.',
  })
  @ValidateIf((dto) => dto.status === JobApplicationStatus.REJECTED)
  @IsString()
  @IsNotEmpty({ message: 'Rejection reason is required.' })
  @MaxLength(2000)
  rejectionReason?: string;
}
