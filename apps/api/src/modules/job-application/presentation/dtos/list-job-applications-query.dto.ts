import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/pagination/pagination-query.dto';
import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  includeDeleted?: boolean;
}
