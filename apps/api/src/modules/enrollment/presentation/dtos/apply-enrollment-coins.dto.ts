import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ApplyEnrollmentCoinsDto {
  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(1)
  coins!: number;
}
