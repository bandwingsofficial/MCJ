import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/pagination/pagination-query.dto';
import { PlacementStatus } from '../../domain/enums/placement-status.enum';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

export class ListPlacementsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({ enum: PlacementStatus })
  @IsOptional()
  @IsEnum(PlacementStatus)
  status?: PlacementStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}

export class UpdatePlacementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  designation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  salary?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joiningDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  remarks?: string;

  @ApiPropertyOptional({ enum: PlacementStatus })
  @IsOptional()
  @IsEnum(PlacementStatus)
  status?: PlacementStatus;
}
