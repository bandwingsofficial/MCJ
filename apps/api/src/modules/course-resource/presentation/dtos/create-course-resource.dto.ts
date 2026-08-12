import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ResourceType } from '../../domain/enums/resource-type.enum';

export class CreateCourseResourceDto {
  @ApiProperty()
  @IsUUID()
  lessonId!: string;

  @ApiProperty({ example: 'Cheat Sheet' })
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @ApiPropertyOptional({
    enum: ResourceType,
    default: ResourceType.OTHER,
  })
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
