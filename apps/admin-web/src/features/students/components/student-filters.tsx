"use client";

import { useMemo } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";

import {
  STUDENT_STATUS_FILTER_OPTIONS,
} from "@/src/features/students/constants/student.constants";
import type {
  BranchOption,
  StudentFilters,
} from "@/src/features/students/types/student.types";
import {
  applyStudentStatusFilter,
  getStudentStatusFilterValue,
  type StudentStatusFilterValue,
} from "@/src/features/students/utils/student-list.utils";
import {
  STUDENT_SELECT_ALL,
  uniqueSelectOptions,
} from "@/src/features/students/utils/student-select.utils";

interface Props {
  filters: StudentFilters;
  branches: BranchOption[];
  onChange: (filters: StudentFilters) => void;
  onReset: () => void;
}

export function StudentFiltersPanel({
  filters,
  branches,
  onChange,
  onReset,
}: Props) {
  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.branchId ||
      filters.status ||
      filters.includeDeleted,
  );

  const statusFilterValue = getStudentStatusFilterValue(filters);

  const branchOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All Branches", value: STUDENT_SELECT_ALL },
        ...branches.map((branch) => ({
          label: `${branch.branchName} (${branch.branchCode})`,
          value: branch.id,
        })),
      ]),
    [branches],
  );

  const statusOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All Status", value: STUDENT_SELECT_ALL },
        ...STUDENT_STATUS_FILTER_OPTIONS.map((item) => ({
          label: item.label,
          value: item.value,
        })),
      ]),
    [],
  );

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-2.5 xl:flex-row xl:items-center">
        <div className="min-w-0 flex-1">
          <SearchInput
            value={filters.search ?? ""}
            placeholder="Search students..."
            className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
            onChange={(value) => onChange({ ...filters, search: value })}
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:shrink-0 xl:items-center">
          <AppSelect
            value={filters.branchId ?? STUDENT_SELECT_ALL}
            triggerClassName="!h-10 min-w-0 rounded-lg px-3 text-[15px] xl:w-44"
            placeholder="Branch"
            onValueChange={(value) =>
              onChange({
                ...filters,
                branchId: value === STUDENT_SELECT_ALL ? undefined : value,
              })
            }
            options={branchOptions}
          />

          <AppSelect
            value={statusFilterValue}
            triggerClassName="!h-10 min-w-0 rounded-lg px-3 text-[15px] xl:w-36"
            onValueChange={(value) =>
              onChange(
                applyStudentStatusFilter(
                  filters,
                  value as StudentStatusFilterValue | typeof STUDENT_SELECT_ALL,
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
