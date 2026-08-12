import { Transform } from 'class-transformer';
import { IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const trim = (value: unknown) =>
  typeof value === 'string' ? value.trim() : value;

export class VerifyPaymentDto {
  @ApiProperty()
  @IsUUID()
  enrollmentId!: string;

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
