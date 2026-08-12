import { IsInt, IsUUID, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class ReorderBranchesDto {
  @IsUUID()
  branchId!: string;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  newDisplayOrder!: number;
}
