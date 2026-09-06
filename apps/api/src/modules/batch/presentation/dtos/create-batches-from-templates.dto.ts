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
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { DurationType } from '@modules/course/domain/enums/duration-type.enum';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

export class CreateBatchesFromTemplatesDto {
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
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  templateIds!: string[];

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  capacity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  durationValue?: number;

  @ApiPropertyOptional({ enum: DurationType })
  @IsOptional()
  @IsEnum(DurationType)
  durationType?: DurationType;

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
}
