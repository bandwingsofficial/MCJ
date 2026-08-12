import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : undefined,
  )
  skip?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    value !== undefined ? Number(value) : undefined,
  )
  take?: number;
}
