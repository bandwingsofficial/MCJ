import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentMethod } from '@modules/payment/domain/enums/payment-method.enum';

import { CreateEnrollmentInstallmentDto } from './create-enrollment-installment.dto';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string' ? value.trim() || undefined : value;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => toNumber(value))
  initialPaymentAmount?: number;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @MaxLength(255)
  @Transform(({ value }) => trimOrUndefined(value))
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  initialPaymentPaidAt?: string;

  @ApiPropertyOptional({ type: [CreateEnrollmentInstallmentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEnrollmentInstallmentDto)
  installments?: CreateEnrollmentInstallmentDto[];
}
