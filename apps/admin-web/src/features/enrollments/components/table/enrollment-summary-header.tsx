"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import {
  EnrollmentFilters as Filters,
  EnrollmentStatus,
} from "@/src/features/enrollments/types";

const ALL_VALUE = "ALL";

const STATUS_OPTIONS = [
  { label: "All Status", value: ALL_VALUE },
  { label: "Pending", value: EnrollmentStatus.PENDING },
  { label: "Pending Approval", value: EnrollmentStatus.PENDING_APPROVAL },
  { label: "Admitted", value: EnrollmentStatus.ADMITTED },
  { label: "Active", value: EnrollmentStatus.ACTIVE },
  { label: "Completed", value: EnrollmentStatus.COMPLETED },
  { label: "Cancelled", value: EnrollmentStatus.CANCELLED },
  { label: "Dropped", value: EnrollmentStatus.DROPPED },
  { label: "Rejected", value: EnrollmentStatus.REJECTED },
];

interface BranchOption {
  id: string;
  branchName: string;
  branchCode?: string | null;
}

interface EnrollmentSummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createDisabled?: boolean;
  filters: Filters;
  branches: BranchOption[];
  onFiltersChange: (filters: Filters) => void;
}

export function EnrollmentSummaryHeader({
  total,
  isLoading = false,
  onCreate,
  createDisabled = false,
  filters,
  branches,
  onFiltersChange,
}: EnrollmentSummaryHeaderProps) {
  const searchValue = filters.search ?? "";

  const branchOptions = useMemo(
    () => [
      { label: "All Branches", value: ALL_VALUE },
      ...branches.map((branch) => ({
        label: branch.branchCode
          ? `${branch.branchName} (${branch.branchCode})`
          : branch.branchName,
        value: branch.id,
      })),
    ],
    [branches],
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
            Enrolments
          </span>
        </nav>

        {isLoading ? (
          <Skeleton className="h-10 w-full rounded-lg sm:w-[190px]" />
        ) : (
          <Button
            type="button"
            onClick={onCreate}
            disabled={createDisabled}
            className="h-10 w-full shrink-0 rounded-lg bg-blue-600 px-4 font-semibold shadow-sm transition-all hover:bg-blue-700 hover:shadow-md sm:w-auto"
            aria-label="Create a new enrolment"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Create Enrolment
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
                Enrolments
              </h1>

              <span className="text-sm text-slate-500">
                Total Enrolments:
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
                  placeholder="Search enrolments..."
                  className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
                  onChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      search: value,
                      skip: 0,
                    })
                  }
                />
              </div>

              <div className="w-full sm:w-[180px]">
                <AppSelect
                  value={filters.branchId ?? ALL_VALUE}
                  triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      branchId: value === ALL_VALUE ? undefined : value,
                      skip: 0,
                    })
                  }
                  options={branchOptions}
                />
              </div>

              <div className="w-full sm:w-[160px]">
                <AppSelect
                  value={filters.status ?? ALL_VALUE}
                  triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      status:
                        value === ALL_VALUE
                          ? undefined
                          : (value as EnrollmentStatus),
                      skip: 0,
                    })
                  }
                  options={STATUS_OPTIONS}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
