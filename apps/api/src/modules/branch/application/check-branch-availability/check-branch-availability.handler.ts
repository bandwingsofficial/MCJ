import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { BranchCode } from '../../domain/value-objects/branch-code.vo';

import { CheckBranchAvailabilityQuery } from './check-branch-availability.query';
import { CheckBranchAvailabilityResult } from './check-branch-availability.result';

export class CheckBranchAvailabilityHandler {
  constructor(
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    query: CheckBranchAvailabilityQuery,
  ): Promise<CheckBranchAvailabilityResult> {
    let branchCodeAvailable: boolean | null = null;
    let branchCodeMessage: string | null = null;
    let branchNameAvailable: boolean | null = null;
    let branchNameMessage: string | null = null;

    if (query.branchCode?.trim()) {
      try {
        const code = BranchCode.create(query.branchCode).getValue();
        const exists = await this.branchRepo.existsByBranchCode(
          code,
          query.excludeId,
        );
        branchCodeAvailable = !exists;
        branchCodeMessage = exists
          ? 'Branch code already exists.'
          : null;
      } catch (error) {
        branchCodeAvailable = false;
        branchCodeMessage =
          error instanceof Error
            ? error.message
            : 'Invalid branch code format';
      }
    }

    if (query.branchName?.trim()) {
      const existing =
        await this.branchRepo.findByBranchNameInsensitive(
          query.branchName,
          query.excludeId,
        );
      branchNameAvailable = !existing;
      branchNameMessage = existing
        ? 'Branch name already exists.'
        : null;
    }

    return new CheckBranchAvailabilityResult(
      branchCodeAvailable,
      branchNameAvailable,
      branchCodeMessage,
      branchNameMessage,
    );
  }
}
