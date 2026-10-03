export interface BranchAdmittedStudentBlock {
  branchId: string;
  branchName: string;
  studentId: string;
  studentName: string;
}

export type BranchDestructiveOperation =
  | "deactivate"
  | "archive"
  | "delete";

function operationLabel(operation: BranchDestructiveOperation): string {
  switch (operation) {
    case "deactivate":
      return "deactivated";
    case "archive":
      return "archived";
    case "delete":
      return "deleted";
    default:
      return "updated";
  }
}

export function buildBranchAdmittedBlockTitle(
  operation: BranchDestructiveOperation,
  bulk: boolean,
): string {
  if (bulk) {
    switch (operation) {
      case "deactivate":
        return "Cannot deactivate selected branches";
      case "archive":
        return "Cannot archive selected branches";
      case "delete":
        return "Cannot delete selected branches";
      default:
        return "Action blocked";
    }
  }

  switch (operation) {
    case "deactivate":
      return "Cannot deactivate branch";
    case "archive":
      return "Cannot archive branch";
    case "delete":
      return "Cannot delete branch";
    default:
      return "Action blocked";
  }
}

export function formatBranchAdmittedBlockDescription(
  blocks: BranchAdmittedStudentBlock[],
  operation: BranchDestructiveOperation,
): string {
  if (blocks.length === 0) {
    return "";
  }

  const verb = operationLabel(operation);
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
    `The following admitted student enrollments must be resolved before this action. Branches cannot be ${verb} while they have students with ADMITTED status:`,
    "",
  ];

  for (const entry of byBranch.values()) {
    lines.push(`• ${entry.branchName}: ${entry.students.join(", ")}`);
  }

  return lines.join("\n");
}
