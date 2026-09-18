"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";

import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { Batch } from "@/src/features/batches/types/batch.types";
import type { Course } from "@/src/features/courses/types/course.types";
import {
  formatCourseMode,
  formatDuration,
} from "@/src/features/courses/utils/course-display.utils";
import { getCourseBatchesSectionPath } from "@/src/features/courses/utils/course-route.utils";
import {
  resolveEnrollmentBranchName,
  resolveEnrollmentSchedule,
} from "@/src/features/enrollments/utils/enrollment-configuration.utils";
import type { EnrollmentTimingSnapshot } from "@/src/features/enrollments/utils/enrollment-selection-storage";

interface EnrollmentSelectedConfigurationProps {
  course: Course;
  batch: Batch | null;
  branchId?: string | null;
  batchTimingId?: string | null;
  mode?: string | null;
  branchNameOverride?: string | null;
  timingSnapshot?: EnrollmentTimingSnapshot | null;
  isLoading?: boolean;
  compact?: boolean;
}

function ConfigRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[6.75rem_minmax(0,1fr)] items-start gap-2 text-sm sm:grid-cols-[7.5rem_minmax(0,1fr)]">
      <span className="pt-0.5 text-xs font-medium text-slate-500 sm:text-sm">
        {label}
      </span>
      <p className="min-w-0 font-semibold leading-snug text-[#0B1F3A]">
        {value}
      </p>
    </div>
  );
}

export function EnrollmentSelectedConfiguration({
  course,
  batch,
  branchId,
  batchTimingId,
  mode,
  branchNameOverride,
  timingSnapshot,
  isLoading = false,
  compact = false,
}: EnrollmentSelectedConfigurationProps) {
  if (isLoading) {
    return (
      <section className="overflow-hidden rounded-2xl border border-[#E2EAF4] bg-white shadow-[0_8px_24px_-18px_rgba(15,40,80,0.35)]">
        <div className="border-b border-[#EAF0F7] px-4 py-3">
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="space-y-3 p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </section>
    );
  }

  if (!batch) {
    return null;
  }

  const schedule = resolveEnrollmentSchedule({
    batch,
    batchTimingId,
    mode,
    timingSnapshot,
  });
  const branchName =
    branchNameOverride?.trim() ||
    resolveEnrollmentBranchName({
      branchId,
      course,
      batch,
    });
  const duration = formatDuration(course.duration, course.durationType);
  const padding = compact ? "px-4 py-3.5" : "px-4 py-4 sm:px-5 sm:py-5";

  return (
    <section className="overflow-hidden rounded-2xl border border-[#E2EAF4] bg-white shadow-[0_8px_24px_-18px_rgba(15,40,80,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAF0F7] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#D7E4F5] bg-[#F7FAFF] text-[#2563D9]">
            <Settings2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#0B1F3A]">
            Selected Configuration
          </h2>
        </div>
        <Link
          href={getCourseBatchesSectionPath(course)}
          className="text-xs font-semibold text-[#2563D9] hover:text-[#1746A2] hover:underline"
        >
          Change selection
        </Link>
      </div>

      <div className={`space-y-3 ${padding}`}>
        <ConfigRow
          label="Learning Mode"
          value={formatCourseMode(schedule.learningMode)}
        />
        <ConfigRow label="Branch" value={branchName} />
        <ConfigRow label="Batch" value={batch.name?.trim() || "—"} />
        <ConfigRow
          label="Batch Timing"
          value={schedule.batchTimingDisplay.combined}
        />
        <ConfigRow label="Start Date" value={schedule.startDate} />
        <ConfigRow label="Days" value={schedule.days} />
        <ConfigRow label="Duration" value={duration} />
      </div>
    </section>
  );
}
