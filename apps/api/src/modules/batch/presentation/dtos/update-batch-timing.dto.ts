import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ''
    ? Number(value)
    : undefined;

export class UpdateBatchTimingDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  @Transform(({ value }) => toNumber(value))
  capacity!: number;
}
