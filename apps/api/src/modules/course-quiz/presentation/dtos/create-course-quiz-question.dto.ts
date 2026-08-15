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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { QuizQuestionType } from '../../domain/enums/quiz-question-type.enum';

export class CreateCourseQuizQuestionOptionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  optionText!: string;

  @ApiPropertyOptional({ default: false })
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

export class CreateCourseQuizQuestionDto {
  @ApiProperty()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  questionText!: string;

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
  explanation?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    value === undefined || value === null ? value : Number(value),
  )
  points?: number;

  @ApiProperty({ type: [CreateCourseQuizQuestionOptionDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateCourseQuizQuestionOptionDto)
  options!: CreateCourseQuizQuestionOptionDto[];
}
