"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type {
  BatchFilters,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import {
  applyBatchArchiveFilter,
  getBatchArchiveFilterValue,
  type BatchArchiveFilterValue,
} from "@/src/features/batches/utils/batch-list.utils";
import {
  BATCH_SELECT_ALL,
  uniqueSelectOptions,
} from "@/src/features/batches/utils/batch-select.utils";

interface BatchSummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createLabel?: string;
  createDisabled?: boolean;
  filters: BatchFilters;
  courses: CourseOption[];
  onFiltersChange: (filters: BatchFilters) => void;
}

export function BatchSummaryHeader({
  total,
  isLoading = false,
  onCreate,
  createLabel = "Create / Assign Batch",
  createDisabled = false,
  filters,
  courses,
  onFiltersChange,
}: BatchSummaryHeaderProps) {
  const archiveFilterValue = getBatchArchiveFilterValue(filters);

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

  const archiveOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "Archive: All", value: BATCH_SELECT_ALL },
        { label: "Archive: Active", value: "ACTIVE" },
        { label: "Archive: Archived", value: "ARCHIVED" },
      ]),
    [],
  );

  return (
    <header className="px-1 py-1">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
        <div className="min-w-0 space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-xs"
          >
            <Link
              href="/dashboard"
              className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
            >
              Home
            </Link>

            <ChevronRight
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />

            <span
              aria-current="page"
              className="font-medium text-[#102A56]"
            >
              Batches
            </span>
          </nav>

          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Batches
              </h1>

              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Batches:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {total}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:shrink-0">
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-full rounded-lg sm:w-[160px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[180px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[160px] sm:shrink-0">
                <AppSelect
                  value={filters.courseId ?? BATCH_SELECT_ALL}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
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

              <div className="w-full sm:w-[140px] sm:shrink-0">
                <AppSelect
                  value={archiveFilterValue}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    onFiltersChange(
                      applyBatchArchiveFilter(
                        filters,
                        value as
                          | BatchArchiveFilterValue
                          | typeof BATCH_SELECT_ALL,
                      ),
                    )
                  }
                  options={archiveOptions}
                />
              </div>

              <Button
                type="button"
                onClick={onCreate}
                disabled={createDisabled}
                className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
                aria-label={createLabel}
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                {createLabel}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
