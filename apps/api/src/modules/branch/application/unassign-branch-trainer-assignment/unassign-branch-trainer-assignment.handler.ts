import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { UnassignBranchTrainerAssignmentCommand } from './unassign-branch-trainer-assignment.command';
import { UnassignBranchTrainerAssignmentResult } from './unassign-branch-trainer-assignment.result';

export class UnassignBranchTrainerAssignmentHandler {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(
    command: UnassignBranchTrainerAssignmentCommand,
  ): Promise<UnassignBranchTrainerAssignmentResult> {
    const branch = await this.branchRepo.findById(command.branchId);

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    await this.branchRepo.unassignBranchTrainerAssignment(
      command.branchId,
      command.assignmentId,
    );

    return new UnassignBranchTrainerAssignmentResult(
      command.branchId,
      command.assignmentId,
      true,
    );
  }
}
