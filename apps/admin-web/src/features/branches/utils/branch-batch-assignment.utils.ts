import type { Batch } from "@/src/features/batches/types/batch.types";

export function batchIsAssignedToBranch(
  batch: Pick<Batch, "branchId" | "assignedBranchIds">,
  branchId: string,
): boolean {
  if (batch.branchId === branchId) {
    return true;
  }

  return batch.assignedBranchIds?.includes(branchId) ?? false;
}
