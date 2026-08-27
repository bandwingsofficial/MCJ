"use client";

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

export function BranchUserFiltersBar({
  filters,
  onChange,
}: Props) {
  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <SearchInput
          value={filters.search}
          placeholder="Search users..."
          className="h-[46px] rounded-xl !py-2 pl-9 text-[15px]"
          onChange={(value) =>
            onChange({
              ...filters,
              search: value,
            })
          }
        />
      </div>

      <div className="w-full shrink-0 sm:w-48">
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

      <div className="w-full shrink-0 sm:w-48">
        <AppSelect
          value={filters.status ?? "ALL"}
          onValueChange={(value) =>
            onChange({
              ...filters,
              status:
                value === "ALL"
                  ? undefined
                  : (value as BranchUserFilters["status"]),
            })
          }
          options={[...BRANCH_USER_STATUS_OPTIONS]}
        />
      </div>
    </div>
  );
}
