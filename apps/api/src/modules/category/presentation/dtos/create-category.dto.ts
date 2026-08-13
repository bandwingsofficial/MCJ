import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CategoryStatus } from '../../domain/enums/category-status.enum';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Digital Marketing' })
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

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
    default: CategoryStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(CategoryStatus)
  status?: CategoryStatus;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : undefined,
  )
  displayOrder?: number;

  @ApiPropertyOptional({
    description:
      'Upload file ID returned from POST /admin/uploads',
  })
  @IsOptional()
  @IsUUID()
  thumbnailFileId?: string;
}
