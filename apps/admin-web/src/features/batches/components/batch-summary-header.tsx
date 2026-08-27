"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

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

interface BatchSummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createDisabled?: boolean;
  filters: BatchFilters;
  courses: CourseOption[];
  onFiltersChange: (filters: BatchFilters) => void;
}

export function BatchSummaryHeader({
  total,
  isLoading = false,
  onCreate,
  createDisabled = false,
  filters,
  courses,
  onFiltersChange,
}: BatchSummaryHeaderProps) {
  const searchValue = filters.search ?? "";
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
    <header>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm"
        >
          <Link
            href="/dashboard"
            className="text-slate-500 transition-colors hover:text-blue-600"
          >
            Home
          </Link>

          <ChevronRight
            className="h-4 w-4 text-slate-400"
            aria-hidden="true"
          />

          <span
            aria-current="page"
            className="font-medium text-slate-900"
          >
            Batches
          </span>
        </nav>

        {isLoading ? (
          <Skeleton className="h-10 w-full rounded-lg sm:w-[170px]" />
        ) : (
          <Button
            type="button"
            onClick={onCreate}
            disabled={createDisabled}
            className="h-10 w-full shrink-0 rounded-lg bg-blue-600 px-4 font-semibold shadow-sm transition-all hover:bg-blue-700 hover:shadow-md sm:w-auto"
            aria-label="Create a new batch"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Create Batch
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Batches
              </h1>

              <span className="text-sm text-slate-500">
                Total Batches:
                <span className="ml-1 font-semibold tabular-nums text-slate-900">
                  {total}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:shrink-0 lg:justify-end">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-full rounded-lg sm:w-[340px]" />
              <Skeleton className="h-10 w-full rounded-lg sm:w-[190px]" />
              <Skeleton className="h-10 w-full rounded-lg sm:w-[160px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[340px]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search batches..."
                  className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
                  onChange={(value) =>
                    onFiltersChange({ ...filters, search: value })
                  }
                />
              </div>

              <div className="w-full sm:w-[190px]">
                <AppSelect
                  value={filters.courseId ?? BATCH_SELECT_ALL}
                  triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      courseId:
                        value === BATCH_SELECT_ALL ? undefined : value,
                    })
                  }
                  options={courseOptions}
                />
              </div>

              <div className="w-full sm:w-[160px]">
                <AppSelect
                  value={statusFilterValue}
                  triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
                  onValueChange={(value) =>
                    onFiltersChange(
                      applyBatchStatusFilter(
                        filters,
                        value as
                          | BatchStatusFilterValue
                          | typeof BATCH_SELECT_ALL,
                      ),
                    )
                  }
                  options={statusOptions}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
