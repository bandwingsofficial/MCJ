import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@common/pagination/pagination-query.dto';
import { PaymentGateway } from '../../domain/enums/payment-gateway.enum';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';
import { PaymentStatus } from '../../domain/enums/payment-status.enum';

const toBoolean = (value: unknown) =>
  value === true || value === 'true';

export class ListPaymentsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  enrollmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethod })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @ApiPropertyOptional({ enum: PaymentGateway })
  @IsOptional()
  @IsEnum(PaymentGateway)
  gateway?: PaymentGateway;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => toBoolean(value))
  includeDeleted?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
