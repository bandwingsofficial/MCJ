import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsUUID, ValidateIf } from 'class-validator';

import { CreateBatchDto } from './create-batch.dto';

export class UpdateBatchDto extends PartialType(
  OmitType(CreateBatchDto, ['trainerIds', 'branchId'] as const),
) {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  branchId?: string | null;
}
