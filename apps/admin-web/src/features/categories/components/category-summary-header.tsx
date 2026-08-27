"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { CategoryStatus } from "@/src/features/categories/types/category.types";

interface CategorySummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createDisabled?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  status?: CategoryStatus;
  onStatusChange: (status: CategoryStatus | undefined) => void;
}

export function CategorySummaryHeader({
  total,
  isLoading = false,
  onCreate,
  createDisabled = false,
  search,
  onSearchChange,
  status,
  onStatusChange,
}: CategorySummaryHeaderProps) {
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
            Categories
          </span>
        </nav>

        {isLoading ? (
          <Skeleton className="h-[52px] w-full rounded-[14px] sm:w-[190px]" />
        ) : (
          <Button
            type="button"
            onClick={onCreate}
            disabled={createDisabled}
            className="admin-create-btn h-[52px] w-full shrink-0 px-5 font-semibold sm:w-[190px]"
            aria-label="Create a new category"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Create Category
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
                Categories
              </h1>

              <span className="text-sm text-[#647A9B]">
                Total Categories:
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
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[380px]" />
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-[170px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[380px]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search categories..."
                  className="h-[46px] rounded-xl !py-2 pl-9 text-[15px]"
                  onChange={onSearchChange}
                />
              </div>

              <div className="w-full sm:w-[170px]">
                <AppSelect
                  value={status ?? "ALL"}
                  triggerClassName="h-[46px] rounded-xl px-3 text-[15px]"
                  onValueChange={(value) =>
                    onStatusChange(
                      value === "ALL"
                        ? undefined
                        : (value as "ACTIVE" | "INACTIVE"),
                    )
                  }
                  options={[
                    {
                      label: "All Status",
                      value: "ALL",
                    },
                    {
                      label: "Active",
                      value: "ACTIVE",
                    },
                    {
                      label: "Inactive",
                      value: "INACTIVE",
                    },
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
