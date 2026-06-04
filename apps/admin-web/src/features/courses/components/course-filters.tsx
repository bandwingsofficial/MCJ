"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";

import { AppSelect } from "@/src/shared/components/ui/select";

import { Switch } from "@/src/shared/components/ui/switch";

import { Label } from "@/src/shared/components/ui/label";

import type {
  CourseFilters,
} from "@/src/features/courses/types/course.types";

interface Props {
  filters: CourseFilters;

  onChange: (
    filters: CourseFilters
  ) => void;
}

export function CourseFilters({
  filters,
  onChange,
}: Props) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
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

      <div className="w-full lg:w-[220px]">
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
                  : (value as CourseFilters["status"]),
            })
          }
          options={[
            {
              label: "All Status",
              value: "ALL",
            },
            {
              label: "Draft",
              value: "DRAFT",
            },
            {
              label: "Active",
              value: "ACTIVE",
            },
            {
              label: "Inactive",
              value: "INACTIVE",
            },
            {
              label: "Archived",
              value: "ARCHIVED",
            },
          ]}
        />
      </div>

      <div className="flex items-center gap-3">
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