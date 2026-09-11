"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import type {
  BatchFilters,
  BatchLifecycleStatus,
} from "@/src/features/batches/types/batch.types";
import { BATCH_SELECT_ALL } from "@/src/features/batches/utils/batch-select.utils";

import {
  BRANCH_COMPACT_SEARCH_CLASS,
  BRANCH_COMPACT_SELECT_CLASS,
} from "./branch-manage-layout.constants";

const STATUS_OPTIONS = [
  { label: "All", value: BATCH_SELECT_ALL },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Expired", value: "EXPIRED" },
] as const;

interface Props {
  filters: BatchFilters;
  onChange: (filters: BatchFilters) => void;
}

export function BranchBatchFiltersBar({ filters, onChange }: Props) {
  const statusValue = filters.batchStatus ?? BATCH_SELECT_ALL;

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:flex-1 lg:justify-end">
      <div className="w-full sm:w-[220px]">
        <SearchInput
          value={filters.search ?? ""}
          placeholder="Search batches..."
          className={BRANCH_COMPACT_SEARCH_CLASS}
          onChange={(value) => onChange({ ...filters, search: value })}
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <AppSelect
          value={statusValue}
          triggerClassName={BRANCH_COMPACT_SELECT_CLASS}
          onValueChange={(value) =>
            onChange({
              ...filters,
              batchStatus:
                value === BATCH_SELECT_ALL
                  ? undefined
                  : (value as BatchLifecycleStatus),
            })
          }
          options={[...STATUS_OPTIONS]}
        />
      </div>
    </div>
  );
}
