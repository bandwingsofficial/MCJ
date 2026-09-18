import { Transform } from 'class-transformer';
import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePublicEnrollmentDto {
  @ApiProperty()
  @IsUUID()
  batchId!: string;

  @ApiProperty()
  @IsUUID()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  batchTimingId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  branchId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  courseId?: string;
}
