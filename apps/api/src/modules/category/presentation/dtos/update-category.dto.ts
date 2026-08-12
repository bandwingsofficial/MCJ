import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Digital Marketing' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name?: string;

  @ApiPropertyOptional({ example: 'digital-marketing' })
  @IsOptional()
  @IsString()
  @MaxLength(140)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiPropertyOptional({
    enum: CategoryStatus,
  })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : undefined,
  )
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  branchId?: string | null;

  @ApiPropertyOptional({
    description:
      'Upload file ID from POST /admin/uploads, or null to remove image',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  thumbnailFileId?: string | null;
}
