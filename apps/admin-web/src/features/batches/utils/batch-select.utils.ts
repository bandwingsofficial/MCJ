export const BATCH_SELECT_ALL = "ALL";

/** Radix Select cannot use "" as an item value — use this sentinel for "no branch". */
export const BATCH_BRANCH_NONE = "__BATCH_BRANCH_NONE__";

export function uniqueSelectOptions<T extends { label: string; value: string }>(
  options: T[],
): T[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const value = option.value.trim();

    if (!value) {
      return false;
    }

    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

export function toBranchSelectValue(branchId?: string | null): string {
  return branchId?.trim() ? branchId : BATCH_BRANCH_NONE;
}

export function fromBranchSelectValue(value: string): string {
  return value === BATCH_BRANCH_NONE ? "" : value;
}
