import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/pagination/pagination-query.dto';
import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class ListCategoriesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: CategoryStatus })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

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
