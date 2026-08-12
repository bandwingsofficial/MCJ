import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/pagination/pagination-query.dto';

export class ListCourseLessonsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  moduleId?: string;

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
