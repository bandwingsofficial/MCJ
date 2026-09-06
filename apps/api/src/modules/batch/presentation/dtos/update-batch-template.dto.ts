import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class UpdateBatchTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;

  @ApiPropertyOptional({ enum: CourseMode })
  @IsOptional()
  @IsEnum(CourseMode)
  mode?: CourseMode;

  @ApiPropertyOptional({ enum: DayOfWeek, isArray: true })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(DayOfWeek, { each: true })
  daysOfWeek?: DayOfWeek[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'startTime must be HH:mm',
  })
  @Transform(({ value }) => trimOrUndefined(value))
  startTime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'endTime must be HH:mm',
  })
  @Transform(({ value }) => trimOrUndefined(value))
  endTime?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  hasFixedTime?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isActive?: boolean;
}
