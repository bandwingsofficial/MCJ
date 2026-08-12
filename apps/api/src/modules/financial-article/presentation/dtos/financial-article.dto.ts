import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string'
    ? value.trim() || undefined
    : value;

export class CreateFinancialArticleDto {
  @ApiProperty()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => trimOrUndefined(value))
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => trimOrUndefined(value))
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  thumbnailFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bannerFileId?: string;

  @ApiPropertyOptional({ default: 'MCJ Team' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => trimOrUndefined(value))
  authorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({ enum: FinancialArticleStatus })
  @IsOptional()
  @IsEnum(FinancialArticleStatus)
  status?: FinancialArticleStatus;
}

export class UpdateFinancialArticleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => trimOrUndefined(value))
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  @Transform(({ value }) => trimOrUndefined(value))
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  thumbnailFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  bannerFileId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => trimOrUndefined(value))
  authorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorImage?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: FinancialArticleStatus })
  @IsOptional()
  @IsEnum(FinancialArticleStatus)
  status?: FinancialArticleStatus;
}

export class MoveFinancialArticleDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : undefined,
  )
  newPosition!: number;
}

export class ListFinancialArticlesQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: FinancialArticleStatus })
  @IsOptional()
  @IsEnum(FinancialArticleStatus)
  status?: FinancialArticleStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) => trimOrUndefined(value))
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ''
      ? Number(value)
      : undefined,
  )
  skip?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) =>
    value !== undefined && value !== null && value !== ''
      ? Number(value)
      : undefined,
  )
  take?: number;
}
