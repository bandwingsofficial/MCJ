import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const trim = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;

export class VerifyPaymentDto {
  @ApiPropertyOptional({
    description:
      'Required for legacy enrollment-first payments. Omit for enrollment checkout payments.',
  })
  @IsOptional()
  @IsUUID()
  enrollmentId?: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => trim(value))
  razorpayOrderId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => trim(value))
  razorpayPaymentId!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(512)
  @Transform(({ value }) => trim(value))
  razorpaySignature!: string;
}
