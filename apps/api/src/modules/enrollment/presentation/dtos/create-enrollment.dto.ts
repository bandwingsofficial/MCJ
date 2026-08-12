import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string' ? value.trim() || undefined : value;

// branchId, categoryId and courseId are intentionally NOT accepted here.
// They are derived on the server from the chosen batch and course.
export class CreateEnrollmentDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty()
  @IsUUID()
  batchId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  feeAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  discountAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  paidAmount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @Transform(({ value }) => trimOrUndefined(value))
  remarks?: string;
}
