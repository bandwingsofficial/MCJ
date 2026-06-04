"use client";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import {
  BRANCH_USER_ROLE_OPTIONS,
  BRANCH_USER_STATUS_OPTIONS,
} from "@/src/features/branch-users/constants/branch-user.constants";

import type {
  BranchUserFilters,
} from "@/src/features/branch-users/types/branch-user.types";

interface Props {
  filters: BranchUserFilters;

  onChange: (
    filters: BranchUserFilters
  ) => void;
}

export const BranchUserFiltersBar = ({
  filters,
  onChange,
}: Props) => {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="min-w-[300px] flex-1">
        <SearchInput
          value={filters.search}
          onChange={(value) =>
            onChange({
              ...filters,
              search: value,
            })
          }
        />
      </div>

      <div className="w-[220px]">
        <AppSelect
  value={filters.role ?? "ALL"}
  onValueChange={(value) =>
    onChange({
      ...filters,
      role:
        value === "ALL"
          ? undefined
          : (value as never),
    })
  }
  options={[
    {
      label: "All Roles",
      value: "ALL",
    },
    ...BRANCH_USER_ROLE_OPTIONS,
  ]}
/>
      </div>

      <div className="w-[220px]">
        <AppSelect
  value={filters.status ?? "ALL"}
  onValueChange={(value) =>
    onChange({
      ...filters,
      status:
        value === "ALL"
          ? undefined
          : (value as
              | "ACTIVE"
              | "INACTIVE"),
    })
  }
  options={[
    ...BRANCH_USER_STATUS_OPTIONS,
  ]}
/>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={
            filters.includeDeleted
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

        <span className="text-sm">
          Include Deleted
        </span>
      </div>
    </div>
  );
};