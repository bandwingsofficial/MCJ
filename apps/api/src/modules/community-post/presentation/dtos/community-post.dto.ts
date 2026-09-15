import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';

export class CreateCommunityPostDto {
  @ApiProperty({ enum: CommunityPostType })
  @IsEnum(CommunityPostType)
  type!: CommunityPostType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2200)
  caption?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mediaFileId?: string;

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
