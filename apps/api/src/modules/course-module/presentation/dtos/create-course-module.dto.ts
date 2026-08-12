import { Transform } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseModuleDto {
  @ApiProperty()
  @IsUUID()
  courseId!: string;

  @ApiProperty({ example: 'Introduction' })
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keySkills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  thumbnailUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : undefined,
  )
  duration?: number;
}
