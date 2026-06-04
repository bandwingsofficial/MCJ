"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";

import { AppSelect } from "@/src/shared/components/ui/select";

import { Switch } from "@/src/shared/components/ui/switch";

import { Label } from "@/src/shared/components/ui/label";

import type {
  CategoryFilters,
} from "@/src/features/categories/types/category.types";

interface Props {
  filters: CategoryFilters;

  onChange: (
    filters: CategoryFilters
  ) => void;
}

export function CategoryFilters({
  filters,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
      <div className="flex-1">
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

      <div className="w-full lg:w-56">
        <AppSelect
          value={
            filters.status ??
            "ALL"
          }
          onValueChange={(
            value
          ) =>
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
            {
              label: "All Status",
              value: "ALL",
            },
            {
              label: "Active",
              value: "ACTIVE",
            },
            {
              label: "Inactive",
              value: "INACTIVE",
            },
          ]}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={
            filters.includeDeleted
          }
          onCheckedChange={(
            checked
          ) =>
            onChange({
              ...filters,
              includeDeleted:
                checked,
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