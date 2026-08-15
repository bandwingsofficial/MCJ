"use client";

import { useMemo } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import {
  BATCH_MODES,
  BATCH_STATUS_FILTER_OPTIONS,
} from "@/src/features/batches/constants/batch.constants";
import type {
  BatchFilters,
  BranchOption,
  CourseOption,
  TrainerOption,
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
  branches: BranchOption[];
  trainers: TrainerOption[];
  onChange: (filters: BatchFilters) => void;
  onReset: () => void;
}

function uniqueOptions<T extends { label: string; value: string }>(
  options: T[],
): T[] {
  return uniqueSelectOptions(options);
}

export function BatchFilters({
  filters,
  courses,
  branches,
  trainers,
  onChange,
  onReset,
}: Props) {
  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.courseId ||
      filters.branchId ||
      filters.trainerId ||
      filters.mode ||
      filters.status ||
      filters.includeDeleted,
  );

  const statusFilterValue = getBatchStatusFilterValue(filters);

  const courseOptions = useMemo(
    () =>
      uniqueOptions([
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

  const branchOptions = useMemo(
    () =>
      uniqueOptions([
        { label: "All Branches", value: BATCH_SELECT_ALL },
        ...branches.map((branch) => ({
          label: `${branch.branchName} (${branch.branchCode})`,
          value: branch.id,
        })),
      ]),
    [branches],
  );

  const trainerOptions = useMemo(
    () =>
      uniqueOptions([
        { label: "All Trainers", value: BATCH_SELECT_ALL },
        ...trainers.map((trainer) => ({
          label: [trainer.firstName, trainer.lastName]
            .filter(Boolean)
            .join(" "),
          value: trainer.id,
        })),
      ]),
    [trainers],
  );

  const modeOptions = useMemo(
    () =>
      uniqueOptions([
        { label: "All Types", value: BATCH_SELECT_ALL },
        ...BATCH_MODES.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      ]),
    [],
  );

  const statusOptions = useMemo(
    () =>
      uniqueOptions([
        { label: "All Status", value: BATCH_SELECT_ALL },
        ...BATCH_STATUS_FILTER_OPTIONS,
      ]),
    [],
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchInput
            value={filters.search ?? ""}
            placeholder="Search batches..."
            className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
            onChange={(value) => onChange({ ...filters, search: value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:shrink-0 xl:items-center">
          <AppSelect
            value={filters.courseId ?? BATCH_SELECT_ALL}
            triggerClassName="!h-10 min-w-0 rounded-lg px-3 text-[15px] xl:w-44"
            placeholder="Course"
            onValueChange={(value) =>
              onChange({
                ...filters,
                courseId: value === BATCH_SELECT_ALL ? undefined : value,
              })
            }
            options={courseOptions}
          />

          <AppSelect
            value={filters.branchId ?? BATCH_SELECT_ALL}
            triggerClassName="!h-10 min-w-0 rounded-lg px-3 text-[15px] xl:w-44"
            placeholder="Branch"
            onValueChange={(value) =>
              onChange({
                ...filters,
                branchId: value === BATCH_SELECT_ALL ? undefined : value,
              })
            }
            options={branchOptions}
          />

          <AppSelect
            value={filters.trainerId ?? BATCH_SELECT_ALL}
            triggerClassName="!h-10 min-w-0 rounded-lg px-3 text-[15px] xl:w-44"
            placeholder="Trainer"
            onValueChange={(value) =>
              onChange({
                ...filters,
                trainerId: value === BATCH_SELECT_ALL ? undefined : value,
              })
            }
            options={trainerOptions}
          />

          <AppSelect
            value={filters.mode ?? BATCH_SELECT_ALL}
            triggerClassName="!h-10 min-w-0 rounded-lg px-3 text-[15px] xl:w-36"
            onValueChange={(value) =>
              onChange({
                ...filters,
                mode: value === BATCH_SELECT_ALL ? undefined : (value as typeof filters.mode),
              })
            }
            options={modeOptions}
          />

          <AppSelect
            value={statusFilterValue}
            triggerClassName="!h-10 min-w-0 rounded-lg px-3 text-[15px] xl:w-36"
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

          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={onReset}
            >
              Reset
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
