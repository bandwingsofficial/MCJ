import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';

export class UpdateCourseQuizQuestionOptionDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  optionText!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    value === undefined || value === null ? value : Number(value),
  )
  displayOrder?: number;
}

export class UpdateCourseQuizQuestionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  questionText?: string;

  @ApiPropertyOptional({ enum: QuizQuestionType })
  @IsOptional()
  @IsEnum(QuizQuestionType)
  type?: QuizQuestionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  explanation?: string | null;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    value === undefined || value === null ? value : Number(value),
  )
  points?: number;

  @ApiPropertyOptional({ type: [UpdateCourseQuizQuestionOptionDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateCourseQuizQuestionOptionDto)
  options?: UpdateCourseQuizQuestionOptionDto[];
}
