"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Switch } from "@/src/shared/components/ui/switch";

import type {
  CourseResourceFilters,
} from "@/src/features/course-resources/types";

interface CourseResourceFiltersProps {
  filters: CourseResourceFilters;

  onChange: (
    filters: CourseResourceFilters,
  ) => void;
}

export function CourseResourceFilters({
  filters,
  onChange,
}: CourseResourceFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:max-w-sm">
        <SearchInput
          value=""
          onChange={() => {}}
          placeholder="Search resources..."
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm">
          Show Deleted
        </span>

        <Switch
          checked={
            filters.includeDeleted
          }
          onCheckedChange={(
            checked,
          ) =>
            onChange({
              ...filters,
              includeDeleted:
                checked,
            })
          }
        />
      </div>
    </div>
  );
}