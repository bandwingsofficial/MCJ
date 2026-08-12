import { Transform } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCourseLessonDto {
  @ApiPropertyOptional({ example: 'What is Java?' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  videoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : undefined,
  )
  duration?: number;
}
