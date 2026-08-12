import { Transform } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MoveCourseResourceDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : undefined,
  )
  newPosition!: number;
}
