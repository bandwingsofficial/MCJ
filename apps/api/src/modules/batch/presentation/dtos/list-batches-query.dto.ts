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
import { BatchStatus } from '../../domain/enums/batch-status.enum';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

export class ListBatchesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courseId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional({ enum: BatchStatus })
  @IsOptional()
  @IsEnum(BatchStatus)
  status?: BatchStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  includeDeleted?: boolean;
}
