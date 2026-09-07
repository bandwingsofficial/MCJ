import { Transform, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DurationType } from '@modules/course/domain/enums/duration-type.enum';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';

import { BatchModeConfigDto } from './batch-mode-config.dto';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

/**
 * Creates ONE batch. Every id in `templateIds` becomes a child timing of it.
 */
export class CreateBatchWithTimingsDto {
  @ApiProperty()
  @IsUUID()
  courseId!: string;

  @ApiProperty({ example: '2026-09-10' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-11-10' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  templateIds?: string[];

  @ApiPropertyOptional({ type: [BatchModeConfigDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchModeConfigDto)
  modeConfigs?: BatchModeConfigDto[];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  capacity?: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  durationValue!: number;

  @ApiProperty({ enum: DurationType, example: DurationType.MONTHS })
  @IsEnum(DurationType)
  durationType!: DurationType;

  @ApiPropertyOptional({ example: 22000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  originalPrice?: number;

  @ApiPropertyOptional({ example: 7000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  discountAmount?: number;

  @ApiPropertyOptional({ example: 15000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  discountedPrice?: number;

  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFree?: boolean;

  @ApiPropertyOptional({ example: 'August Batch' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;
}
