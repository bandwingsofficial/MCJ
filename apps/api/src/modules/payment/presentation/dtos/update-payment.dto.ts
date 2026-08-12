import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaymentStatus } from '../../domain/enums/payment-status.enum';

const trimOrUndefined = (value: unknown) =>
  typeof value === 'string' ? value.trim() || undefined : value;

export class UpdatePaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  @Transform(({ value }) => trimOrUndefined(value))
  remarks?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => trimOrUndefined(value))
  transactionId?: string;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description:
      'Only REFUNDED is supported to refund a successful payment.',
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;
}
