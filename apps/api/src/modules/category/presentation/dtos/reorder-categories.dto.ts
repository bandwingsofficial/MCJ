import { IsInt, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ReorderCategoriesDto {
  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  newDisplayOrder!: number;
}
