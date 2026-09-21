import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/pagination/pagination-query.dto';
import { JobApplicationInterviewStatus } from '../../domain/enums/job-application-interview-status.enum';
import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';
import { JobApplicationStatusGroup } from '../../domain/enums/job-application-status-group.enum';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

export class ListJobApplicationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: JobApplicationStatus })
  @IsOptional()
  @IsEnum(JobApplicationStatus)
  status?: JobApplicationStatus;

  @ApiPropertyOptional({
    enum: JobApplicationStatusGroup,
    description:
      'Admin tab grouping. Prefer over single status for Pending/Shortlisted/Rejected.',
  })
  @IsOptional()
  @IsEnum(JobApplicationStatusGroup)
  statusGroup?: JobApplicationStatusGroup;

  @ApiPropertyOptional({ enum: JobApplicationInterviewStatus })
  @IsOptional()
  @IsEnum(JobApplicationInterviewStatus)
  interviewStatus?: JobApplicationInterviewStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appliedFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  appliedTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  includeDeleted?: boolean;
}
