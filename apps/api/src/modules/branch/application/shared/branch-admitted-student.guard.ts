import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type {
  BranchAdmittedStudentBlock,
  BranchRepository,
} from '../../domain/repositories/branch.repository';

export type BranchDestructiveOperation =
  | 'deactivate'
  | 'archive'
  | 'delete';

function operationVerb(operation: BranchDestructiveOperation): string {
  switch (operation) {
    case 'deactivate':
      return 'deactivated';
    case 'archive':
      return 'archived';
    case 'delete':
      return 'deleted';
    default:
      return 'modified';
  }
}

export function formatBranchAdmittedStudentBlockMessage(
  blocks: BranchAdmittedStudentBlock[],
  operation: BranchDestructiveOperation,
): string {
  const verb = operationVerb(operation);

  if (blocks.length === 0) {
    return '';
  }

  const byBranch = new Map<
    string,
    { branchName: string; students: string[] }
  >();

  for (const block of blocks) {
    const existing = byBranch.get(block.branchId);
    if (existing) {
      if (!existing.students.includes(block.studentName)) {
        existing.students.push(block.studentName);
      }
      continue;
    }

    byBranch.set(block.branchId, {
      branchName: block.branchName,
      students: [block.studentName],
    });
  }

  const lines: string[] = [
    `This branch cannot be ${verb} while it has enrolled students with ADMITTED status:`,
  ];

  for (const entry of byBranch.values()) {
    lines.push(
      `• ${entry.branchName}: ${entry.students.join(', ')}`,
    );
  }

  return lines.join('\n');
}

export async function assertBranchesHaveNoAdmittedStudents(
  branchRepo: BranchRepository,
  branchIds: string[],
  operation: BranchDestructiveOperation,
): Promise<void> {
  const uniqueIds = [
    ...new Set(
      branchIds.map((id) => id?.trim()).filter(Boolean) as string[],
    ),
  ];

  if (uniqueIds.length === 0) {
    return;
  }

  const blocks =
    await branchRepo.findAdmittedStudentBlocksByBranchIds(
      uniqueIds,
    );

  if (blocks.length === 0) {
    return;
  }

  throw new BaseException(
    ERROR_CODES.BRANCH_ADMITTED_STUDENT_BLOCK,
    formatBranchAdmittedStudentBlockMessage(blocks, operation),
    409,
    { blocks },
  );
}
