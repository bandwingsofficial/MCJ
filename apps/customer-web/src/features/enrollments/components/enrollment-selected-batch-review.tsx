"use client";

import Link from "next/link";
import {
  CalendarDays,
  Clock3,
  MapPin,
  Monitor,
  Users,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { Batch } from "@/src/features/batches/types/batch.types";
import type { Course } from "@/src/features/courses/types/course.types";
import { formatCourseMode, formatCurrency, getCoursePricing } from "@/src/features/courses/utils/course-display.utils";
import { getCourseBatchesSectionPath } from "@/src/features/courses/utils/course-route.utils";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
  getBatchAvailableSeats,
  getBatchStatusLabel,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";

interface EnrollmentSelectedBatchReviewProps {
  course: Course;
  batch: Batch | null;
  isLoading?: boolean;
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export function EnrollmentSelectedBatchReview({
  course,
  batch,
  isLoading = false,
}: EnrollmentSelectedBatchReviewProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-24 w-full rounded-xl" />
        <p className="mt-4 text-sm text-slate-500">
          Loading course and batch details...
        </p>
      </section>
    );
  }

  if (!batch) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Selected Batch
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Your enrollment is linked to this batch.
          </p>
        </div>
        <Link
          href={getCourseBatchesSectionPath(course)}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
        >
          Change batch
        </Link>
      </div>

      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-base font-semibold text-slate-900">
            {batch.name}
          </h4>
          {batch.code ? (
            <span className="text-sm font-medium text-slate-500">
              {batch.code}
            </span>
          ) : null}
          <Badge variant="info">{getBatchStatusLabel(batch.status)}</Badge>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <DetailRow
            icon={MapPin}
            label="Branch"
            value={batch.branch?.branchName ?? "Not assigned"}
          />
          <DetailRow
            icon={Monitor}
            label="Mode"
            value={formatCourseMode(batch.mode)}
          />
          <DetailRow
            icon={CalendarDays}
            label="Start Date"
            value={formatEnrollmentDate(batch.startDate)}
          />
          <DetailRow
            icon={CalendarDays}
            label="End Date"
            value={formatEnrollmentDate(batch.endDate)}
          />
          <DetailRow
            icon={Clock3}
            label="Timing"
            value={`${formatEnrollmentTime(batch.startTime)} – ${formatEnrollmentTime(batch.endTime)}`}
          />
          <DetailRow
            icon={CalendarDays}
            label="Working Days"
            value={formatBatchDays(batch.daysOfWeek ?? [])}
          />
          <DetailRow
            icon={Users}
            label="Capacity"
            value={String(batch.capacity)}
          />
          <DetailRow
            icon={Users}
            label="Enrolled"
            value={String(batch.enrolledCount)}
          />
          <DetailRow
            icon={Users}
            label="Available Seats"
            value={String(getBatchAvailableSeats(batch))}
          />
          <DetailRow
            icon={Users}
            label="Trainer"
            value={
              batch.trainers?.length
                ? batch.trainers
                    .map((trainer) =>
                      `${trainer.firstName} ${trainer.lastName}`.trim(),
                    )
                    .filter(Boolean)
                    .join(", ")
                : "—"
            }
          />
          <DetailRow
            icon={Monitor}
            label="Course"
            value={course.title}
          />
          <DetailRow
            icon={Monitor}
            label="Course Category"
            value={course.categoryName?.trim() || "—"}
          />
          <DetailRow
            icon={Monitor}
            label="Fee"
            value={(() => {
              const pricing = getCoursePricing(course);
              return formatCurrency(pricing.discountedPrice, pricing.currency);
            })()}
          />
        </div>
      </div>
    </section>
  );
}
