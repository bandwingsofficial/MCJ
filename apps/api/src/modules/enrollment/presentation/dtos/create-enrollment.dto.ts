import { Transform } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

// branchId, categoryId, courseId and batch schedule fields are derived from batchId.
export class CreateEnrollmentDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty()
  @IsUUID()
  batchId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  feeAmount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  discountAmount?: number;
}
