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
              Students
            </span>
          </nav>

          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Students
              </h1>

              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Students:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {total}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-full rounded-lg sm:w-[280px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[150px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[280px]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search students..."
                  className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                  onChange={(value) =>
                    onFiltersChange({ ...filters, search: value })
                  }
                />
              </div>

              <div className="w-full sm:w-[140px]">
                <AppSelect
                  value={filters.branchId ?? STUDENT_SELECT_ALL}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
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

              <div className="w-full sm:w-[140px]">
                <AppSelect
                  value={statusFilterValue}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
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

              <Button
                type="button"
                onClick={onCreate}
                disabled={createDisabled}
                className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
                aria-label="Create a new student"
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Create Student
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
