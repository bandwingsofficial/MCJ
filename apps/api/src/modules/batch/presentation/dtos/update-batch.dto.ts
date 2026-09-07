import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsOptional,
  IsUUID,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

import { CreateBatchDto } from './create-batch.dto';
import { BatchModeConfigDto } from './batch-mode-config.dto';

export class UpdateBatchDto extends PartialType(
  OmitType(CreateBatchDto, ['trainerIds', 'branchId'] as const),
) {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  branchId?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  templateIds?: string[];

  @ApiPropertyOptional({ type: [BatchModeConfigDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchModeConfigDto)
  modeConfigs?: BatchModeConfigDto[];
}
