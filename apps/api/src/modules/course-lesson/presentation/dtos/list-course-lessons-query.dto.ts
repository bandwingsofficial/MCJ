import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/pagination/pagination-query.dto';

import { LessonContentType } from '../../domain/enums/lesson-content-type.enum';

export class ListCourseLessonsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  moduleId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentLessonId?: string;

  @ApiPropertyOptional({ enum: ['root'] })
  @IsOptional()
  @IsIn(['root'])
  parentLessonScope?: 'root';

  @ApiPropertyOptional({ enum: LessonContentType })
  @IsOptional()
  @IsEnum(LessonContentType)
  contentType?: LessonContentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;
}
