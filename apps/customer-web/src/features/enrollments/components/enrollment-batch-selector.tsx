"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
  Monitor,
  Users,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { formatCourseMode } from "@/src/features/courses/utils/course-display.utils";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
  getBatchAvailableSeats,
  getBatchStatusLabel,
  isBatchFull,
  isBatchSelectable,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";

interface EnrollmentBatchSelectorProps {
  batches: Batch[];
  selectedBatchId?: string;
  isLoading: boolean;
  error: string | null;
  onSelect: (batchId: string) => void;
  onRetry: () => void;
}

export function EnrollmentBatchSelector({
  batches,
  selectedBatchId,
  isLoading,
  error,
  onSelect,
  onRetry,
}: EnrollmentBatchSelectorProps) {
  if (isLoading) {
    return (
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-3">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <ErrorState
          title="Unable to load batches"
          description="We could not load available batches for this course."
          onRetry={onRetry}
        />
      </section>
    );
  }

  if (batches.length === 0) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <EmptyState
          title="No batches available"
          description="There are currently no batches open for enrollment in this course."
        />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Select Your Batch
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose the schedule that works best for you.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {batches.map((batch) => {
          const selectable = isBatchSelectable(batch);
          const full = isBatchFull(batch);
          const availableSeats = getBatchAvailableSeats(batch);
          const isSelected = selectedBatchId === batch.id;

          return (
            <div
              key={batch.id}
              className={`rounded-xl border p-4 transition ${
                isSelected
                  ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                  : selectable
                    ? "border-slate-200 bg-white hover:border-slate-300"
                    : "border-slate-200 bg-slate-50 opacity-80"
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-slate-900">
                      {batch.name}
                    </h4>
                    <Badge variant="info">
                      {getBatchStatusLabel(batch.status)}
                    </Badge>
                    {full ? (
                      <Badge variant="danger">Full</Badge>
                    ) : null}
                  </div>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    {batch.code}
                  </p>

                  <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{batch.branch?.branchName ?? "—"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>{formatCourseMode(batch.mode)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>
                        {formatEnrollmentDate(batch.startDate)}
                        {" - "}
                        {formatEnrollmentDate(batch.endDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>
                        {formatBatchDays(batch.daysOfWeek)}
                        {" · "}
                        {formatEnrollmentTime(batch.startTime)}
                        {" - "}
                        {formatEnrollmentTime(batch.endTime)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-2">
                      <Users className="h-4 w-4 shrink-0 text-slate-400" />
                      <span>
                        {full
                          ? "No seats available"
                          : `${availableSeats} / ${batch.capacity} seats available`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  <Button
                    type="button"
                    variant={isSelected ? "primary" : "outline"}
                    disabled={!selectable}
                    className={`h-10 rounded-xl px-5 ${
                      isSelected
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "border-slate-200"
                    }`}
                    onClick={() => onSelect(batch.id)}
                  >
                    {isSelected ? "Selected" : full ? "Full" : "Select"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
