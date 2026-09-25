import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicEnrollmentCheckoutDto {
  @ApiProperty()
  @IsUUID()
  batchId!: string;

  @ApiProperty()
  @IsUUID()
  batchTimingId!: string;

  @ApiProperty()
  @IsUUID()
  branchId!: string;

  @ApiProperty()
  @IsUUID()
  courseId!: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Transform(({ value }) =>
    value === undefined || value === null ? 0 : Number(value),
  )
  @IsInt()
  @Min(0)
  coinsToRedeem?: number;
}
