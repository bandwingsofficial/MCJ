"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import type {
  BatchTimingModeFilter,
  BatchTimingStatusFilter,
} from "@/src/features/batch-templates/hooks/use-batch-templates";

interface Props {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createDisabled?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  mode?: BatchTimingModeFilter;
  onModeChange: (mode: BatchTimingModeFilter | undefined) => void;
  status?: BatchTimingStatusFilter;
  onStatusChange: (status: BatchTimingStatusFilter | undefined) => void;
}

export function BatchTemplateSummaryHeader({
  isLoading = false,
  onCreate,
  createDisabled = false,
  search,
  onSearchChange,
  mode,
  onModeChange,
  status,
  onStatusChange,
}: Props) {
  const searchValue = search ?? "";

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
              Batch Timings
            </span>
          </nav>

          {isLoading ? (
            <Skeleton className="h-8 w-52 rounded-md" />
          ) : (
            <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
              Batch Timings
            </h1>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
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
                  placeholder="Search batch timings..."
                  className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                  onChange={onSearchChange}
                />
              </div>

              <div className="w-full sm:w-[140px] sm:shrink-0">
                <AppSelect
                  value={mode ?? "ALL"}
                  triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                  onValueChange={(value) =>
                    onModeChange(
                      value === "ALL"
                        ? undefined
                        : (value as BatchTimingModeFilter),
                    )
                  }
                  options={[
                    { label: "All Mode", value: "ALL" },
                    ...FILTER_BATCH_MODES.map((item) => ({
                      label: item.label,
                      value: item.value,
                    })),
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
                        : (value as BatchTimingStatusFilter),
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
                aria-label="Add batch timing"
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                Add Batch Timing
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
