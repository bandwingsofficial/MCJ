"use client";

import { useMemo } from "react";

import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import type {
  BatchFilters,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import {
  applyBatchStatusFilter,
  getBatchStatusFilterValue,
  type BatchStatusFilterValue,
} from "@/src/features/batches/utils/batch-list.utils";
import {
  BATCH_SELECT_ALL,
  uniqueSelectOptions,
} from "@/src/features/batches/utils/batch-select.utils";

interface Props {
  filters: BatchFilters;
  courses: CourseOption[];
  onChange: (filters: BatchFilters) => void;
}

export function BatchFilters({
  filters,
  courses,
  onChange,
}: Props) {
  const statusFilterValue = getBatchStatusFilterValue(filters);

  const courseOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All Courses", value: BATCH_SELECT_ALL },
        ...courses.map((course) => ({
          label: course.code
            ? `${course.title} (${course.code})`
            : course.title,
          value: course.id,
        })),
      ]),
    [courses],
  );

  const statusOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All Status", value: BATCH_SELECT_ALL },
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
        { label: "Archived", value: "ARCHIVED" },
      ]),
    [],
  );

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <SearchInput
          value={filters.search ?? ""}
          placeholder="Search batches..."
          className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
          onChange={(value) => onChange({ ...filters, search: value })}
        />
      </div>

      <div className="w-full shrink-0 sm:w-48">
        <AppSelect
          value={filters.courseId ?? BATCH_SELECT_ALL}
          triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
          onValueChange={(value) =>
            onChange({
              ...filters,
              courseId: value === BATCH_SELECT_ALL ? undefined : value,
            })
          }
          options={courseOptions}
        />
      </div>

      <div className="w-full shrink-0 sm:w-48">
        <AppSelect
          value={statusFilterValue}
          triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
          onValueChange={(value) =>
            onChange(
              applyBatchStatusFilter(
                filters,
                value as BatchStatusFilterValue | typeof BATCH_SELECT_ALL,
              ),
            )
          }
          options={statusOptions}
        />
      </div>
    </div>
  );
}
