import type { BatchListItem } from "@/src/features/batches/types/batch.types";

export interface BatchDeleteDependencyBranch {
  branchId: string;
  branchName: string;
}

export interface BatchDeleteDependenciesResponse {
  batchId: string;
  canDelete: boolean;
  branchAssignments: BatchDeleteDependencyBranch[];
}

export function buildSingleBatchDeleteBlockedDescription(
  batchName: string,
  branches: BatchDeleteDependencyBranch[],
): string {
  const lines = branches.map((branch) => `- ${branch.branchName}`);
  return [
    `Batch cannot be deleted because it is assigned to the following branch(es):`,
    "",
    ...lines,
    "",
    "Please unassign the batch from these branches before deleting it.",
  ].join("\n");
}

export function buildBulkBatchDeleteBlockedDescription(
  batches: BatchListItem[],
  assignmentsByBatchId: Record<string, BatchDeleteDependencyBranch[]>,
): string {
  const sections = batches
    .map((batch) => {
      const branches = assignmentsByBatchId[batch.id] ?? [];
      if (branches.length === 0) {
        return null;
      }

      const branchLines = branches.map((branch) => `- ${branch.branchName}`);
      return [batch.name, ...branchLines].join("\n");
    })
    .filter(Boolean);

  return [
    "The selected batches cannot be deleted because they are assigned to branches:",
    "",
    sections.join("\n\n"),
  ].join("\n");
}
