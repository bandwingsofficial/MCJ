import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CourseLevel } from '../../domain/enums/course-level.enum';
import { CourseMode } from '../../domain/enums/course-mode.enum';
import { CourseStatus } from '../../domain/enums/course-status.enum';
import { DurationType } from '../../domain/enums/duration-type.enum';

import { MaterialType } from '../../domain/enums/material-type.enum';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(160)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(180)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(220)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  thumbnailFileId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  @IsUUID('4', { each: true })
  imageUploadIds?: string[];

  @ApiPropertyOptional({
    description:
      'JSON array: [{ "title": "...", "type": "PDF", "uploadId": "...", "externalUrl": "...", "displayOrder": 0 }]',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? JSON.parse(value) : value,
  )
  @IsArray()
  materialUploadIds?: Array<{
    title: string;
    type: MaterialType;
    uploadId?: string;
    externalUrl?: string;
    displayOrder?: number;
  }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  originalPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  discountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  discountedPrice?: number;

  @ApiPropertyOptional({ default: 'INR' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  currency?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFree?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  duration?: number;

  @ApiPropertyOptional({ enum: DurationType })
  @IsOptional()
  @IsEnum(DurationType)
  durationType?: DurationType;

  @ApiPropertyOptional({ enum: CourseLevel })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

@ApiPropertyOptional({
  enum: CourseMode,
  isArray: true,
})
@IsOptional()
@Transform(({ value }) =>
  typeof value === 'string'
    ? JSON.parse(value)
    : value,
)
@IsArray()
@IsEnum(CourseMode, { each: true })
modes?: CourseMode[];

  @ApiPropertyOptional({ default: 'English' })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Transform(({ value }) => toNumber(value))
  averageRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  totalReviews?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  isPopular?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  metaKeywords?: string;

@ApiPropertyOptional({
  type: [String],
})
@IsOptional()
@Transform(({ value }) =>
  typeof value === 'string'
    ? JSON.parse(value)
    : value,
)
@IsArray()
@IsUUID('4', { each: true })
branchIds?: string[];

  @ApiPropertyOptional({ enum: CourseStatus })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;
}
