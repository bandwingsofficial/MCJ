import { IsEnum } from 'class-validator';

import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class UpdateBranchStatusDto {
  @IsEnum(BranchStatus)
  status!: BranchStatus;
}
