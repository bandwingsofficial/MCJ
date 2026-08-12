import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EmploymentType } from '../../domain/enums/employment-type.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';
import { WorkingDays } from '../../domain/enums/working-days.enum';

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string'
    ? value.trim() || undefined
    : value;

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

class InterviewProcessStepDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  description!: string;
}

export class CreateJobDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => trimOrUndefined(value))
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => trimOrUndefined(value))
  slug?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  companyName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLogo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  companyWebsite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isRemote?: boolean;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @ApiProperty({ enum: WorkingDays })
  @IsEnum(WorkingDays)
  workingDays!: WorkingDays;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  minExperience?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  maxExperience?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  minSalary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  maxSalary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  vacancies?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  responsibilities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eligibilityTitle?: string;

  @ApiPropertyOptional({ type: [InterviewProcessStepDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewProcessStepDto)
  interviewProcess?: InterviewProcessStepDto[];

  @ApiPropertyOptional({ enum: JobStatus })
  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;
}
