"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { CourseFilterStatus } from "@/src/features/courses/types/course.types";

interface SelectOption {
  label: string;
  value: string;
}

interface CourseSummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createDisabled?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  categoryId?: string;
  categoryOptions: SelectOption[];
  onCategoryChange: (categoryId: string | undefined) => void;
  status?: CourseFilterStatus;
  onStatusChange: (status: CourseFilterStatus | undefined) => void;
}

export function CourseSummaryHeader({
  total,
  isLoading = false,
  onCreate,
  createDisabled = false,
  search,
  onSearchChange,
  categoryId,
  categoryOptions,
  onCategoryChange,
  status,
  onStatusChange,
}: CourseSummaryHeaderProps) {
  const searchValue = search ?? "";

  return (
    <header className="px-1 py-1">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:flex-nowrap lg:items-center lg:justify-between lg:gap-3">
        <div className="shrink-0 space-y-1">
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
              Courses
            </span>
          </nav>

          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 whitespace-nowrap">
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Courses
              </h1>

              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Courses:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {total}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-1.5 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-full rounded-lg sm:w-[220px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
              <Skeleton className="h-9 w-full rounded-lg sm:w-[150px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[220px] sm:shrink-0">
                <SearchInput
                  value={searchValue}
                  placeholder="Search courses..."
                  className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                  onChange={onSearchChange}
                />
              </div>

              <div className="w-full sm:w-[140px] sm:shrink-0">
                <AppSelect
                  value={categoryId ?? "ALL"}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    onCategoryChange(value === "ALL" ? undefined : value)
                  }
                  options={[
                    { label: "All Categories", value: "ALL" },
                    ...categoryOptions,
                  ]}
                />
              </div>

              <div className="w-full sm:w-[140px] sm:shrink-0">
                <AppSelect
                  value={status ?? "ALL"}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    onStatusChange(
                      value === "ALL"
                        ? undefined
                        : (value as CourseFilterStatus),
                    )
                  }
                  options={[
                    { label: "All Status", value: "ALL" },
                    { label: "Active", value: "ACTIVE" },
                    { label: "Inactive", value: "INACTIVE" },
                    { label: "Archived", value: "ARCHIVED" },
                  ]}
                />
              </div>

              <Button
                type="button"
                onClick={onCreate}
                disabled={createDisabled}
                className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
                aria-label="Create a new course"
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Create Course
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
