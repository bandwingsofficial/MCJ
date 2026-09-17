"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Button } from "@/src/shared/components/ui/button";
import { Plus } from "lucide-react";

import type {
  BatchFilters,
  BatchLifecycleStatus,
} from "@/src/features/batches/types/batch.types";
import { BATCH_SELECT_ALL } from "@/src/features/batches/utils/batch-select.utils";

import {
  BRANCH_COMPACT_SEARCH_CLASS,
  BRANCH_COMPACT_SELECT_CLASS,
  BRANCH_PRIMARY_BUTTON_CLASS,
} from "./branch-manage-layout.constants";

const STATUS_OPTIONS = [
  { label: "All", value: BATCH_SELECT_ALL },
  { label: "Ongoing", value: "ONGOING" },
  { label: "Expired", value: "EXPIRED" },
] as const;

interface Props {
  filters: BatchFilters;
  onChange: (filters: BatchFilters) => void;
  assignDisabled?: boolean;
  onAssign?: () => void;
}

export function BranchBatchFiltersBar({
  filters,
  onChange,
  assignDisabled = false,
  onAssign,
}: Props) {
  const statusValue = filters.batchStatus ?? BATCH_SELECT_ALL;

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:w-auto lg:flex-1 lg:justify-end">
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

      {onAssign ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={assignDisabled}
            onClick={onAssign}
            className={BRANCH_PRIMARY_BUTTON_CLASS}
          >
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
            Assign Batch
          </Button>
        </div>
      ) : null}
    </div>
  );
}
