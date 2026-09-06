"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import type {
  BatchFilters,
  BatchMode,
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

  const modeOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All Learning Modes", value: BATCH_SELECT_ALL },
        ...FILTER_BATCH_MODES,
      ]),
    [],
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
    <header>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-sm"
        >
          <Link
            href="/dashboard"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Home
          </Link>

          <ChevronRight
            className="h-4 w-4 text-slate-400"
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
          <Skeleton className="h-[52px] w-full rounded-[14px] sm:w-[210px]" />
        ) : (
          <Button
            type="button"
            onClick={onCreate}
            disabled={createDisabled}
            className="admin-create-btn h-[52px] w-full shrink-0 px-5 font-semibold sm:w-auto"
            aria-label={createLabel}
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {createLabel}
          </Button>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h1 className="text-[30px] font-bold tracking-tight text-[#102A56]">
                Batches
              </h1>

              <span className="text-sm text-[#647A9B]">
                Total Batches:
                <span className="ml-1 font-semibold tabular-nums text-[#102A56]">
                  {total}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:w-auto lg:shrink-0 lg:justify-end">
          {isLoading ? (
            <>
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[190px]" />
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[200px]" />
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[180px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[190px]">
                <AppSelect
                  value={filters.courseId ?? BATCH_SELECT_ALL}
                  triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
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

              <div className="w-full sm:w-[200px]">
                <AppSelect
                  value={filters.mode ?? BATCH_SELECT_ALL}
                  triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      mode:
                        value === BATCH_SELECT_ALL
                          ? undefined
                          : (value as BatchMode),
                    })
                  }
                  options={modeOptions}
                />
              </div>

              <div className="w-full sm:w-[180px]">
                <AppSelect
                  value={archiveFilterValue}
                  triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
