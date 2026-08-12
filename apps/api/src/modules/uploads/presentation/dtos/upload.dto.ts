import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiPropertyOptional({ example: 'categories' })
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  folder!: string;

  @ApiPropertyOptional({ example: 'thumbnail' })
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  fileName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  entityId?: string;
}

export class ReplaceFileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class GetFileQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  objectKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;
}

export class CopyFileDto {
  @ApiPropertyOptional({ example: 'categories' })
  @IsString()
  @MaxLength(120)
  folder!: string;

  @ApiPropertyOptional()
  @IsUUID()
  entityId!: string;

  @ApiPropertyOptional({ example: 'thumbnail' })
  @IsString()
  @MaxLength(120)
  fileName!: string;
}

export class DeleteFilesDto {
  @ApiPropertyOptional({ type: [String] })
  @IsUUID(undefined, { each: true })
  ids!: string[];
}

export class RestoreUploadsDto {
  @ApiPropertyOptional({ type: [String] })
  @IsUUID(undefined, { each: true })
  ids!: string[];
}

export class MoveFileDto {
  @ApiPropertyOptional({ example: 'categories' })
  @IsString()
  @MaxLength(120)
  folder!: string;

  @ApiPropertyOptional()
  @IsUUID()
  entityId!: string;

  @ApiPropertyOptional({ example: 'thumbnail' })
  @IsString()
  @MaxLength(120)
  fileName!: string;
}

export class GetFileByUrlQueryDto {
  @ApiPropertyOptional()
  @IsString()
  url!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;
}

export class GetFileByObjectKeyQueryDto {
  @ApiPropertyOptional()
  @IsString()
  objectKey!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  includeDeleted?: boolean;
}
