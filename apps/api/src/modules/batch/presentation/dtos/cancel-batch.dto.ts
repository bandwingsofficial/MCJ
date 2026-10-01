import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelBatchDto {
  @ApiProperty({
    description: 'Required reason explaining why the batch is being cancelled.',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Cancellation reason is required' })
  @MaxLength(2000)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  reason!: string;
}
