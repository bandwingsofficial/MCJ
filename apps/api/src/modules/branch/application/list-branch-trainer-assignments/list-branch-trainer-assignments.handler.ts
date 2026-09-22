import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { ListBranchTrainerAssignmentsQuery } from './list-branch-trainer-assignments.query';
import { ListBranchTrainerAssignmentsResult } from './list-branch-trainer-assignments.result';

export class ListBranchTrainerAssignmentsHandler {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(
    query: ListBranchTrainerAssignmentsQuery,
  ): Promise<ListBranchTrainerAssignmentsResult> {
    const branch = await this.branchRepo.findById(query.branchId);

    if (!branch) {
      throw new BranchNotFoundException(query.branchId);
    }

    const items = await this.branchRepo.listBranchTrainerAssignments(
      query.branchId,
    );

    return new ListBranchTrainerAssignmentsResult(query.branchId, items);
  }
}
