"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import type { BranchFilters as BranchFiltersType } from "@/src/features/branches/types/branch.types";

interface BranchFiltersProps {
  filters: BranchFiltersType;

  onChange: (filters: BranchFiltersType) => void;
}

export function BranchFilters({
  filters,
  onChange,
}: BranchFiltersProps) {
  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <SearchInput
          value={filters.search ?? ""}
          placeholder="Search branches..."
          className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
          onChange={(value: string) =>
            onChange({
              ...filters,
              search: value,
            })
          }
        />
      </div>

      <div className="w-full shrink-0 sm:w-48">
        <AppSelect
          value={filters.status ?? "ALL"}
          triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
          onValueChange={(value) =>
            onChange({
              ...filters,
              status:
                value === "ALL"
                  ? undefined
                  : (value as
                      | "ACTIVE"
                      | "INACTIVE"
                      | "ARCHIVED"),
            })
          }
          options={[
            { label: "All Status", value: "ALL" },
            { label: "Active", value: "ACTIVE" },
            { label: "Inactive", value: "INACTIVE" },
            { label: "Archived", value: "ARCHIVED" },
          ]}
        />
      </div>
    </div>
  );
}
