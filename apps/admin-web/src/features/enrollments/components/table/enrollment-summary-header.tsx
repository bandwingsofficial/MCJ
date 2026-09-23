"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import {
  ApplicationType,
  EnrollmentFilters as Filters,
} from "@/src/features/enrollments/types";

const ALL_VALUE = "ALL";

const APPLICATION_TYPE_OPTIONS = [
  { label: "All", value: ALL_VALUE },
  { label: "Online", value: ApplicationType.ONLINE },
  { label: "Offline", value: ApplicationType.OFFLINE },
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
    <header className="px-1 py-1">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <div className="min-w-0 space-y-1">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 text-xs"
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
              Enrolments
            </span>
          </nav>

          {isLoading ? (
            <Skeleton className="h-8 w-52 max-w-full rounded-md" />
          ) : (
            <>
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Enrolments
              </h1>
              <p className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Enrolments:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {total}
                </span>
              </p>
            </>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-full rounded-lg sm:w-[280px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[120px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[150px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[280px]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search enrolments..."
                  className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                  onChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      search: value,
                      skip: 0,
                    })
                  }
                />
              </div>

              <div className="w-full sm:w-[140px]">
                <AppSelect
                  value={filters.branchId ?? ALL_VALUE}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
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

              <div className="w-full sm:w-[120px]">
                <AppSelect
                  value={filters.applicationType ?? ALL_VALUE}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      applicationType:
                        value === ALL_VALUE
                          ? undefined
                          : (value as ApplicationType),
                      skip: 0,
                    })
                  }
                  options={APPLICATION_TYPE_OPTIONS}
                />
              </div>

              <Button
                type="button"
                onClick={onCreate}
                disabled={createDisabled}
                className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
                aria-label="Create a new enrolment"
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Create Enrolment
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
