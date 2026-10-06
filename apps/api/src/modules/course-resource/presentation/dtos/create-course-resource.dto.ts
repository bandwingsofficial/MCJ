import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { ResourceType } from '../../domain/enums/resource-type.enum';

export class CreateCourseResourceDto {
  @ApiPropertyOptional()
  @ValidateIf((dto: CreateCourseResourceDto) => !dto.moduleId)
  @IsUUID()
  lessonId?: string;

  @ApiPropertyOptional()
  @ValidateIf((dto: CreateCourseResourceDto) => !dto.lessonId)
  @IsUUID()
  moduleId?: string;

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
