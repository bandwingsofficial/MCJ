import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';

export class CommunityPostMediaItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty()
  @IsUUID()
  fileId!: string;

  @ApiProperty({ enum: CommunityPostType })
  @IsEnum(CommunityPostType)
  mediaType!: CommunityPostType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class CreateCommunityPostDto {
  @ApiPropertyOptional({ enum: CommunityPostType })
  @IsOptional()
  @IsEnum(CommunityPostType)
  type?: CommunityPostType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mediaFileId?: string;

  @ApiPropertyOptional({ type: [CommunityPostMediaItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommunityPostMediaItemDto)
  media?: CommunityPostMediaItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiPropertyOptional({ default: 'MCJ Community' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  ctaEnabled?: boolean;

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateCommunityPostDto) => dto.ctaEnabled === true)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  ctaLabel?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateCommunityPostDto) => dto.ctaEnabled === true)
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  ctaUrl?: string;

  @ApiPropertyOptional({ enum: CommunityPostStatus })
  @IsOptional()
  @IsEnum(CommunityPostStatus)
  status?: CommunityPostStatus;
}

export class UpdateCommunityPostDto {
  @ApiPropertyOptional({ enum: CommunityPostType })
  @IsOptional()
  @IsEnum(CommunityPostType)
  type?: CommunityPostType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mediaFileId?: string;

  @ApiPropertyOptional({ type: [CommunityPostMediaItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommunityPostMediaItemDto)
  media?: CommunityPostMediaItemDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hashtags?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mentions?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ctaEnabled?: boolean;

  @ApiPropertyOptional()
  @ValidateIf((dto: UpdateCommunityPostDto) => dto.ctaEnabled === true)
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  ctaLabel?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto: UpdateCommunityPostDto) => dto.ctaEnabled === true)
  @IsUrl({ require_protocol: true })
  @MaxLength(2048)
  ctaUrl?: string;

  @ApiPropertyOptional({ enum: CommunityPostStatus })
  @IsOptional()
  @IsEnum(CommunityPostStatus)
  status?: CommunityPostStatus;
}

export class ListCommunityPostsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(CommunityPostStatus)
  status?: CommunityPostStatus;

  @ApiPropertyOptional({ enum: CommunityPostType })
  @IsOptional()
  @IsEnum(CommunityPostType)
  type?: CommunityPostType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') {
      return true;
    }

    if (value === false || value === 'false') {
      return false;
    }

    return undefined;
  })
  isDeleted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === 'true') {
      return true;
    }

    if (value === false || value === 'false') {
      return false;
    }

    return undefined;
  })
  isActive?: boolean;

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
