import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EmploymentType } from '../../domain/enums/employment-type.enum';
import { JobWorkMode } from '../../domain/enums/job-work-mode.enum';
import { WorkingDays } from '../../domain/enums/working-days.enum';

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string' ? value.trim() || undefined : value;

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const toStringArray = (value: unknown): string[] | undefined => {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      return trimmed
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return undefined;
};

const toInterviewProcess = (value: unknown) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return undefined;
    }

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }

  return undefined;
};

export class CreatePublicCompanyJobDto {
  @ApiProperty()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => trimOrUndefined(value))
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) => trimOrUndefined(value))
  companyName!: string;

  @ApiProperty()
  @IsEmail()
  @Transform(({ value }) => trimOrUndefined(value))
  companyEmail!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  @Transform(({ value }) => trimOrUndefined(value))
  companyPhone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  @Transform(({ value }) => trimOrUndefined(value))
  companyWebsite?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  companyDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  shortDescription?: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  description!: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  location!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  state?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  country?: string;

  @ApiProperty({ enum: EmploymentType })
  @IsEnum(EmploymentType)
  employmentType!: EmploymentType;

  @ApiProperty({ enum: WorkingDays })
  @IsEnum(WorkingDays)
  workingDays!: WorkingDays;

  @ApiPropertyOptional({ enum: JobWorkMode })
  @IsOptional()
  @IsEnum(JobWorkMode)
  workMode?: JobWorkMode;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  category!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  minExperience!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  maxExperience?: number;

  @ApiProperty()
  @IsNumber()
  @Min(15000)
  @Transform(({ value }) => toNumber(value))
  minSalary!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  maxSalary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  salaryCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  vacancies?: number;

  @ApiProperty()
  @IsDateString()
  applicationDeadline!: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  responsibilities?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value) ?? [])
  skills!: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  preferredSkills?: string[];

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value) ?? [])
  qualifications!: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  benefits?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => toInterviewProcess(value))
  interviewProcess?: Array<{ title: string; description: string }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyLogo?: string;
}
