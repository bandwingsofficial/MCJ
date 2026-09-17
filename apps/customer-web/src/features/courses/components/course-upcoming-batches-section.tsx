"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Clock3, Users } from "lucide-react";

import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

import type { CourseUpcomingBatchGroup } from "@/src/features/courses/utils/course-batch.utils";

interface CourseUpcomingBatchesSectionProps {
  batches: CourseUpcomingBatchGroup[];
  isLoading?: boolean;
}

function AvailabilityBadge({
  availableSeats,
}: {
  availableSeats: number;
}) {
  if (availableSeats <= 0) {
    return (
      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
        Full
      </span>
    );
  }

  if (availableSeats <= 5) {
    return (
      <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
        {availableSeats} seats left
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
      {availableSeats} seats available
    </span>
  );
}

export function CourseUpcomingBatchesSection({
  batches,
  isLoading = false,
}: CourseUpcomingBatchesSectionProps) {
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);

  useEffect(() => {
    if (batches.length === 0) {
      setActiveBatchId(null);
      return;
    }

    setActiveBatchId((current) =>
      current && batches.some((batch) => batch.batchId === current)
        ? current
        : batches[0]?.batchId ?? null,
    );
  }, [batches]);

  const activeBatch = useMemo(
    () => batches.find((batch) => batch.batchId === activeBatchId) ?? null,
    [activeBatchId, batches],
  );

  if (isLoading) {
    return <Skeleton className="h-72 w-full rounded-xl" />;
  }

  if (batches.length === 0) {
    return (
      <EmptyState
        title="No upcoming batches available"
        description="New upcoming batches will appear here when they are published for this course."
      />
    );
  }

  return (
    <div className="space-y-4">
      {batches.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {batches.map((batch) => (
            <button
              key={batch.batchId}
              type="button"
              onClick={() => setActiveBatchId(batch.batchId)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
                activeBatchId === batch.batchId
                  ? "border-[#2563D9] bg-[#2563D9] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-[#2563D9]/30 hover:text-[#2563D9]",
              )}
            >
              {batch.batchName}
            </button>
          ))}
        </div>
      ) : null}

      {activeBatch ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#2563D9]">
                Upcoming Batch
              </p>
              <h3 className="mt-1 text-lg font-bold text-[#0B1F3A]">
                {activeBatch.batchName}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Batch {activeBatch.batchCode} · {activeBatch.courseTitle}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {activeBatch.modeGroups.map((group) => (
              <div key={group.mode}>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2563D9]">
                  {group.modeLabel}
                </p>

                <div className="mt-3 space-y-3">
                  {group.timings.map((timing) => (
                    <div
                      key={timing.id}
                      className="rounded-lg border border-slate-100 bg-slate-50/60 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-[#0B1F3A]">
                            {timing.name}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                              {timing.startDateLabel}
                              {timing.endDateLabel !== "—"
                                ? ` → ${timing.endDateLabel}`
                                : ""}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Clock3 className="h-3.5 w-3.5 text-blue-500" />
                              {timing.startTimeLabel} – {timing.endTimeLabel}
                            </span>
                            <span>{timing.days}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          <AvailabilityBadge
                            availableSeats={timing.availableSeats}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
