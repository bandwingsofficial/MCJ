import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { SuggestBranchCodeQuery } from './suggest-branch-code.query';
import { SuggestBranchCodeResult } from './suggest-branch-code.result';

/** MCJ = organization prefix, B = branch identifier. */
export const BRANCH_CODE_PREFIX = 'MCJB';

export class SuggestBranchCodeHandler {
  constructor(
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    _query: SuggestBranchCodeQuery,
  ): Promise<SuggestBranchCodeResult> {
    const prefix = BRANCH_CODE_PREFIX;
    const maxSuffix =
      await this.branchRepo.getMaxNumericSuffixForPrefix(prefix);
    const next = maxSuffix + 1;
    const branchCode = `${prefix}${String(next).padStart(3, '0')}`;

    return new SuggestBranchCodeResult(branchCode, prefix);
  }
}
