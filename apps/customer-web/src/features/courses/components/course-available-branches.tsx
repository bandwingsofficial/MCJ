"use client";

import { MapPin } from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { BatchBranch } from "@/src/features/batches/types/batch.types";

interface CourseAvailableBranchesProps {
  branches: BatchBranch[];
  selectedBranchId?: string;
  isLoading?: boolean;
  onSelect: (branchId: string) => void;
}

export function CourseAvailableBranches({
  branches,
  selectedBranchId,
  isLoading = false,
  onSelect,
}: CourseAvailableBranchesProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (branches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          No branches currently available.
        </p>
        <p className="mt-1 text-xs text-slate-500">
          This course does not have an active batch at any branch yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {branches.map((branch) => {
        const selected = branch.id === selectedBranchId;

        return (
          <article
            key={branch.id}
            className={`rounded-xl border bg-white p-4 transition sm:p-5 ${
              selected
                ? "border-blue-200 shadow-sm"
                : "border-slate-200 hover:border-blue-200 hover:shadow-sm"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                  {branch.branchName}
                </h3>
                {branch.branchCode ? (
                  <p className="mt-1 text-xs text-slate-500">{branch.branchCode}</p>
                ) : null}
                <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  <span>Batches available for this course</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => onSelect(branch.id)}
                className="inline-flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-5 py-2.5 text-xs font-semibold text-white transition hover:from-[#1E58C7] hover:to-[#123D94] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {selected ? "Selected" : "Select"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
