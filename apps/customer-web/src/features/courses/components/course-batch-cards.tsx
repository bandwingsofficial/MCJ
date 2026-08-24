"use client";

import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Monitor,
  ArrowRight,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { formatCourseMode } from "@/src/features/courses/utils/course-display.utils";
import { getCourseEnrollPath } from "@/src/features/courses/utils/course-route.utils";

interface Props {
  batches: Batch[] | unknown;
  isLoading?: boolean;
  courseSlug: string;
  variant?: "grid" | "list";
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getBatchStatus(status?: string | null): string {
  if (!status) {
    return "Available";
  }

  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function CourseBatchCards({
  batches,
  isLoading = false,
  courseSlug,
  variant = "list",
}: Props) {
  const router = useRouter();

  /**
   * Never assume the API response is an array.
   */
  const safeBatches: Batch[] = Array.isArray(batches) ? batches : [];

  if (isLoading) {
    return (
      <div
        className={
          variant === "list"
            ? "space-y-3"
            : "grid gap-4 md:grid-cols-2"
        }
      >
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-28 w-full rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (safeBatches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center">
        <p className="text-sm font-medium text-slate-700">
          No batches currently available.
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Please check again later for upcoming batches.
        </p>
      </div>
    );
  }

  const handleEnroll = (batchId: string) => {
    if (!courseSlug || !batchId) {
      return;
    }

    router.push(
      getCourseEnrollPath(
        { slug: courseSlug },
        { batchId },
      ),
    );
  };

  /*
   * LIST VIEW
   *
   * This is the preferred customer-facing presentation.
   */
  if (variant === "list") {
    return (
      <div className="space-y-3">
        {safeBatches.map((batch) => {
          const batchId = batch?.id;

          if (!batchId) {
            return null;
          }

          return (
            <article
              key={batchId}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Batch information */}
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge
                      variant="info"
                      className="text-[10px] font-semibold uppercase tracking-wide"
                    >
                      {getBatchStatus(batch.status)}
                    </Badge>
                  </div>

                  <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                    {batch.name || "Unnamed Batch"}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                      <span>
                        {formatDate(batch.startDate)}{" "}
                        <span className="text-slate-400">→</span>{" "}
                        {formatDate(batch.endDate)}
                      </span>
                    </p>

                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Monitor className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                      <span>
                        {formatCourseMode(batch.mode)}
                      </span>
                    </p>

                    <p className="flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                      <span>
                        {batch.branch?.branchName || "Branch not specified"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Enroll action */}
                <button
                  type="button"
                  onClick={() => handleEnroll(batchId)}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Enroll
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    );
  }

  /*
   * GRID VIEW
   */
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {safeBatches.map((batch) => {
        const batchId = batch?.id;

        if (!batchId) {
          return null;
        }

        return (
          <article
            key={batchId}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 truncate text-base font-semibold text-slate-900">
                {batch.name || "Unnamed Batch"}
              </h3>

              <Badge
                variant="info"
                className="shrink-0 text-[10px] uppercase"
              >
                {getBatchStatus(batch.status)}
              </Badge>
            </div>

            <div className="mt-4 space-y-2.5">
              <p className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                {batch.branch?.branchName || "Branch not specified"}
              </p>

              <p className="flex items-center gap-2 text-sm text-slate-600">
                <CalendarDays className="h-4 w-4 shrink-0 text-indigo-500" />
                {formatDate(batch.startDate)}
                <span className="text-slate-400">→</span>
                {formatDate(batch.endDate)}
              </p>

              <p className="flex items-center gap-2 text-sm text-slate-600">
                <Monitor className="h-4 w-4 shrink-0 text-blue-500" />
                {formatCourseMode(batch.mode)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleEnroll(batchId)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Enroll
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </article>
        );
      })}
    </div>
  );
}