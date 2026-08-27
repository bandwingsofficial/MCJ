"use client";

import Link from "next/link";
import { ChevronRight, Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { TRAINER_TYPES } from "@/src/features/trainers/constants/trainer.constants";

import type {
  TrainerFilterStatus,
  TrainerType,
} from "@/src/features/trainers/types/trainer.types";

interface TrainerSummaryHeaderProps {
  total: number;
  isLoading?: boolean;
  onCreate: () => void;
  createDisabled?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  trainerType?: TrainerType;
  onTrainerTypeChange: (trainerType: TrainerType | undefined) => void;
  status?: TrainerFilterStatus;
  onStatusChange: (status: TrainerFilterStatus | undefined) => void;
}

export function TrainerSummaryHeader({
  total,
  isLoading = false,
  onCreate,
  createDisabled = false,
  search,
  onSearchChange,
  trainerType,
  onTrainerTypeChange,
  status,
  onStatusChange,
}: TrainerSummaryHeaderProps) {
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
            Trainers
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
            aria-label="Create a new trainer"
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Create Trainer
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
                Trainers
              </h1>

              <span className="text-sm text-slate-500">
                Total Trainers:
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
              <Skeleton className="h-10 w-full rounded-lg sm:w-[170px]" />
              <Skeleton className="h-10 w-full rounded-lg sm:w-[160px]" />
            </>
          ) : (
            <>
              <div className="w-full sm:w-[340px]">
                <SearchInput
                  value={searchValue}
                  placeholder="Search trainers..."
                  className="!h-10 rounded-lg !py-2 pl-9 text-[15px]"
                  onChange={onSearchChange}
                />
              </div>

              <div className="w-full sm:w-[170px]">
                <AppSelect
                  value={trainerType ?? "ALL"}
                  triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
                  onValueChange={(value) =>
                    onTrainerTypeChange(
                      value === "ALL"
                        ? undefined
                        : (value as TrainerType),
                    )
                  }
                  options={[
                    { label: "All Type", value: "ALL" },
                    ...TRAINER_TYPES.map((type) => ({
                      label: type.replaceAll("_", " "),
                      value: type,
                    })),
                  ]}
                />
              </div>

              <div className="w-full sm:w-[160px]">
                <AppSelect
                  value={status ?? "ALL"}
                  triggerClassName="!h-10 rounded-lg px-3 text-[15px]"
                  onValueChange={(value) =>
                    onStatusChange(
                      value === "ALL"
                        ? undefined
                        : (value as TrainerFilterStatus),
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
