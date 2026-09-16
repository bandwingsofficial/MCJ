import { Transform } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseLearnItemDto {
  @ApiProperty()
  @IsUUID()
  lessonId!: string;

  @ApiProperty({ example: 'What is a Variable?' })
  @IsString()
  @MinLength(1)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  title!: string;

  @ApiProperty({ example: 'A variable stores data that can change.' })
  @IsString()
  @MinLength(1)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  explanation!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  imageUrl?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (value == null) {
      return value;
    }

    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [value];
      } catch {
        return [value];
      }
    }

    return value;
  })
  keyLearningPoints?: string[] | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  finalThoughts?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  summary?: string | null;
}
