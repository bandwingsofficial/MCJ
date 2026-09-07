import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

export class BatchModeConfigDto {
  @ApiProperty({ enum: CourseMode })
  @IsEnum(CourseMode)
  mode!: CourseMode;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  templateIds!: string[];

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
  currency?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFree?: boolean;
}
