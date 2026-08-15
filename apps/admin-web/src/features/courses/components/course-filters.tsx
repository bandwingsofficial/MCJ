"use client";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Button } from "@/src/shared/components/ui/button";

import {
  COURSE_LEVELS,
} from "@/src/features/courses/constants/course.constants";
import {
  DEFAULT_COURSE_FILTERS,
} from "@/src/features/courses/constants/course.constants";

import type {
  CourseFilters as CourseFiltersType,
} from "@/src/features/courses/types/course.types";

interface SelectOption {
  label: string;
  value: string;
}

interface CourseFiltersProps {
  filters: CourseFiltersType;
  categoryOptions: SelectOption[];
  onChange: (filters: CourseFiltersType) => void;
}

export function CourseFilters({
  filters,
  categoryOptions,
  onChange,
}: CourseFiltersProps) {
  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.categoryId ||
      filters.level ||
      filters.status
  );

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1">
        <SearchInput
          value={filters.search ?? ""}
          placeholder="Search courses..."
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
          value={filters.categoryId ?? "ALL"}
          triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
          onValueChange={(value) =>
            onChange({
              ...filters,
              categoryId:
                value === "ALL" ? undefined : value,
            })
          }
          options={[
            { label: "All Categories", value: "ALL" },
            ...categoryOptions,
          ]}
        />
      </div>

      <div className="w-full shrink-0 sm:w-44">
        <AppSelect
          value={filters.status ?? "ALL"}
          triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
          onValueChange={(value) =>
            onChange({
              ...filters,
              status:
                value === "ALL"
                  ? undefined
                  : (value as CourseFiltersType["status"]),
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

      <div className="w-full shrink-0 sm:w-44">
        <AppSelect
          value={filters.level ?? "ALL"}
          triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
          onValueChange={(value) =>
            onChange({
              ...filters,
              level:
                value === "ALL"
                  ? undefined
                  : (value as CourseFiltersType["level"]),
            })
          }
          options={[
            { label: "All Types", value: "ALL" },
            ...COURSE_LEVELS.map((level) => ({
              label: level.replaceAll("_", " "),
              value: level,
            })),
          ]}
        />
      </div>

      {hasActiveFilters ? (
        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 rounded-lg px-3 text-[15px]"
          onClick={() =>
            onChange({
              ...DEFAULT_COURSE_FILTERS,
              pageSize: filters.pageSize,
            })
          }
        >
          Reset
        </Button>
      ) : null}
    </div>
  );
}
