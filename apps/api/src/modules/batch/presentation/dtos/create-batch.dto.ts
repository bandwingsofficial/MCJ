import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string'
    ? value.trim() || undefined
    : value;

const toStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map(String).map((item) => item.trim()).filter(Boolean);
      }
    } catch {
      return value.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }

  return undefined;
};

export class CreateBatchDto {
  @ApiProperty()
  @IsString()
  @MaxLength(140)
  @Transform(({ value }) => trimOrUndefined(value))
  name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  code!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => trimOrUndefined(value))
  description?: string;

  @ApiProperty()
  @IsUUID()
  courseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiProperty()
  @IsDateString()
  startDate!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: '09:30' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @ApiProperty({ example: '11:30' })
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;

  @ApiProperty({
    enum: DayOfWeek,
    isArray: true,
    description: 'Comma-separated or JSON string array',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(DayOfWeek, { each: true })
  @Transform(({ value }) => toStringArray(value))
  daysOfWeek!: DayOfWeek[];

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  capacity!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  enrolledCount?: number;

  @ApiPropertyOptional({ enum: CourseMode })
  @IsOptional()
  @IsEnum(CourseMode)
  mode?: CourseMode;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => trimOrUndefined(value))
  classroom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl({ require_protocol: true })
  @Transform(({ value }) => trimOrUndefined(value))
  meetingLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFeatured?: boolean;

  @ApiPropertyOptional({ enum: BatchStatus })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiPropertyOptional({
    description: 'Comma-separated or JSON string array',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => toStringArray(value))
  trainerIds?: string[];
}
