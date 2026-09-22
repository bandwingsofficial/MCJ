"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Button } from "@/src/shared/components/ui/button";
import { Plus } from "lucide-react";

import {
  BRANCH_COMPACT_SEARCH_CLASS,
  BRANCH_PRIMARY_BUTTON_CLASS,
} from "./branch-manage-layout.constants";

interface Props {
  search: string;
  onSearchChange: (search: string) => void;
  assignDisabled?: boolean;
  onAssign?: () => void;
}

export function BranchBatchFiltersBar({
  search,
  onSearchChange,
  assignDisabled = false,
  onAssign,
}: Props) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:ml-auto lg:w-auto lg:flex-1 lg:justify-end">
      <div className="w-full sm:w-[220px]">
        <SearchInput
          value={search}
          placeholder="Search batches..."
          className={BRANCH_COMPACT_SEARCH_CLASS}
          onChange={onSearchChange}
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
