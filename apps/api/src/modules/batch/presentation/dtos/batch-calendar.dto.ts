import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { BatchCalendarExceptionStatus } from '@prisma/client';

export class UpsertBatchCalendarExceptionDto {
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsEnum(BatchCalendarExceptionStatus)
  status!: BatchCalendarExceptionStatus;

  @ValidateIf((dto) => dto.status === BatchCalendarExceptionStatus.HOLIDAY)
  @IsString()
  reason?: string;
}

export class BatchCalendarMonthQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/)
  month?: string;
}

export class BatchCalendarRangeQueryDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}
