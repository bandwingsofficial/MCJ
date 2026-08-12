import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentMethod } from '../../domain/enums/payment-method.enum';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class CreateManualPaymentDto {
  @ApiProperty()
  @IsUUID()
  enrollmentId!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => toNumber(value))
  amount!: number;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10)
  @Transform(({ value }) => trimOrUndefined(value))
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => trimOrUndefined(value))
  transactionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @Transform(({ value }) => trimOrUndefined(value))
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  paidAt?: string;
}
