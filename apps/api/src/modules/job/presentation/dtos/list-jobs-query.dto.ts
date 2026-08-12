import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/pagination/pagination-query.dto';
import { EmploymentType } from '../../domain/enums/employment-type.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

export class ListJobsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @ApiPropertyOptional({ enum: EmploymentType })
  @IsOptional()
  @IsEnum(EmploymentType)
  employmentType?: EmploymentType;

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
