"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

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

interface StudentSummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createDisabled?: boolean;
  filters: StudentFilters;
  branches: BranchOption[];
  onFiltersChange: (filters: StudentFilters) => void;
}

export function StudentSummaryHeader({
  total,
  isLoading = false,
  onCreate,
  createDisabled = false,
  filters,
  branches,
  onFiltersChange,
}: StudentSummaryHeaderProps) {
  const searchValue = filters.search ?? "";
  const statusFilterValue = getStudentStatusFilterValue(filters);

  const branchOptions = useMemo(
    () =>
      uniqueSelectOptions([
        { label: "All branch", value: STUDENT_SELECT_ALL },
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
            Students
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
            aria-label="Add a new student"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Add Student
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
                Students
              </h1>

              <span className="text-sm text-slate-500">
                Total Students:
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
              <Skeleton className="h-10 w-full rounded-lg sm:w-[180px]" />
              <Skeleton className="h-10 w-full rounded-lg sm:w-[160px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[340px]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search students..."
                  className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
                  onChange={(value) =>
                    onFiltersChange({ ...filters, search: value })
                  }
                />
              </div>

              <div className="w-full sm:w-[180px]">
                <AppSelect
                  value={filters.branchId ?? STUDENT_SELECT_ALL}
                  triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      branchId:
                        value === STUDENT_SELECT_ALL ? undefined : value,
                    })
                  }
                  options={branchOptions}
                />
              </div>

              <div className="w-full sm:w-[160px]">
                <AppSelect
                  value={statusFilterValue}
                  triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
                  onValueChange={(value) =>
                    onFiltersChange(
                      applyStudentStatusFilter(
                        filters,
                        value as
                          | StudentStatusFilterValue
                          | typeof STUDENT_SELECT_ALL,
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
