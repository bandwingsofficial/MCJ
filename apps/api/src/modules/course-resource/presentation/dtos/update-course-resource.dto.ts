import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { ResourceType } from '../../domain/enums/resource-type.enum';

export class UpdateCourseResourceDto {
  @ApiPropertyOptional({ example: 'Cheat Sheet' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title?: string;

  @ApiPropertyOptional({ enum: ResourceType })
  @IsOptional()
  @IsEnum(ResourceType)
  type?: ResourceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  fileUrl?: string;
}
