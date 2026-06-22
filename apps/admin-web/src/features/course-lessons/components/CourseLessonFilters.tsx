"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Checkbox } from "@/src/shared/components/ui/checkbox";

import type {
  CourseLessonFilters,
} from "@/src/features/course-lessons/types";

interface CourseLessonFiltersProps {
  filters: CourseLessonFilters;

  onChange: (
    filters: CourseLessonFilters,
  ) => void;
}

export function CourseLessonFilters({
  filters,
  onChange,
}: CourseLessonFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-white p-4 md:flex-row md:items-center md:justify-between">
      <div className="w-full md:max-w-sm">
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

      <div className="flex items-center gap-2">
        <Checkbox
          checked={
            filters.includeDeleted
          }
          onCheckedChange={(
            checked,
          ) =>
            onChange({
              ...filters,
              includeDeleted:
                Boolean(
                  checked,
                ),
            })
          }
        />

        <span className="text-sm">
          Show Deleted
        </span>
      </div>
    </div>
  );
}