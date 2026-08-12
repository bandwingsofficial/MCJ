import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { SuggestBranchCodeQuery } from './suggest-branch-code.query';
import { SuggestBranchCodeResult } from './suggest-branch-code.result';

export function buildBranchCodePrefix(branchName: string): string {
  const letters = (branchName ?? '')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase();

  if (!letters) {
    return 'BRN';
  }

  if (letters.length >= 3) {
    return letters.slice(0, 3);
  }

  return letters.padEnd(3, 'X');
}

export class SuggestBranchCodeHandler {
  constructor(
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    query: SuggestBranchCodeQuery,
  ): Promise<SuggestBranchCodeResult> {
    const prefix = buildBranchCodePrefix(query.branchName);
    const maxSuffix =
      await this.branchRepo.getMaxNumericSuffixForPrefix(prefix);
    const next = maxSuffix + 1;
    const branchCode = `${prefix}${String(next).padStart(3, '0')}`;

    return new SuggestBranchCodeResult(branchCode, prefix);
  }
}
