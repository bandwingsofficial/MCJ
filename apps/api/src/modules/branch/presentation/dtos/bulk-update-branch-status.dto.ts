import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';

import { BranchStatus } from '../../domain/enums/branch-status.enum';

import { BULK_BRANCH_MAX_BATCH_SIZE } from '../../application/shared/parse-bulk-branch-ids';

export class BulkUpdateBranchStatusDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_BRANCH_MAX_BATCH_SIZE)
  @IsUUID('4', { each: true })
  @IsString({ each: true })
  branchIds!: string[];

  @IsEnum(BranchStatus)
  status!: BranchStatus;
}
