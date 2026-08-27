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
            Courses
          </span>
        </nav>

        {isLoading ? (
          <Skeleton className="h-[52px] w-full rounded-[14px] sm:w-[170px]" />
        ) : (
          <Button
            type="button"
            onClick={onCreate}
            disabled={createDisabled}
            className="admin-create-btn h-[52px] w-full shrink-0 px-5 font-semibold sm:w-auto"
            aria-label="Create a new course"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Create Course
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
                Courses
              </h1>

              <span className="text-sm text-[#647A9B]">
                Total Courses:
                <span className="ml-1 font-semibold tabular-nums text-[#102A56]">
                  {total}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto lg:shrink-0 lg:justify-end">
          {isLoading ? (
            <>
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[340px]" />
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[180px]" />
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[160px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[340px]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search courses..."
                  className="h-[46px] rounded-xl !py-2 pl-9 text-[15px]"
                  onChange={onSearchChange}
                />
              </div>

              <div className="w-full sm:w-[180px]">
                <AppSelect
                  value={categoryId ?? "ALL"}
                  triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
                  onValueChange={(value) =>
                    onCategoryChange(value === "ALL" ? undefined : value)
                  }
                  options={[
                    { label: "All Categories", value: "ALL" },
                    ...categoryOptions,
                  ]}
                />
              </div>

              <div className="w-full sm:w-[160px]">
                <AppSelect
                  value={status ?? "ALL"}
                  triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
