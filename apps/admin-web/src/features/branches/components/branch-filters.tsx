"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";

import { AppSelect } from "@/src/shared/components/ui/select";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import { Label } from "@/src/shared/components/ui/label";

import type {
  BranchFilters as BranchFiltersType,
} from "@/src/features/branches/types/branch.types";

import {
  BRANCH_STATUS_OPTIONS,
} from "@/src/features/branches/constants/branch.constants";

interface BranchFiltersProps {
  filters: BranchFiltersType;

  onChange: (
    filters: BranchFiltersType
  ) => void;
}

export function BranchFilters({
  filters,
  onChange,
}: BranchFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="w-full lg:max-w-sm">
        <SearchInput
          value={
            filters.search ?? ""
          }
          onChange={(
            value: string
          ) =>
            onChange({
              ...filters,
              search: value,
            })
          }
        />
      </div>

      <div className="w-full lg:w-56">
        <AppSelect
          value={
            filters.status
          }
          onValueChange={(
            value
          ) =>
            onChange({
              ...filters,
              status:
                value as
                  | "ACTIVE"
                  | "INACTIVE",
            })
          }
          options={
            BRANCH_STATUS_OPTIONS
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={
  filters.includeDeleted ?? false
}
          onCheckedChange={(
            checked
          ) =>
            onChange({
              ...filters,
              includeDeleted:
                Boolean(
                  checked
                ),
            })
          }
        />

        <Label>
          Include Deleted
        </Label>
      </div>
    </div>
  );
}