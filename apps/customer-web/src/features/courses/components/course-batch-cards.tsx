"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, MapPin, Users } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { formatCurrency } from "@/src/features/courses/utils/course-display.utils";

interface Props {
  batches: Batch[];
  isLoading?: boolean;
  courseSlug: string;
  coursePrice: number;
  isFree?: boolean;
}

function formatDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatSchedule(batch: Batch): string {
  const days = batch.daysOfWeek?.join(", ");
  const time =
    batch.startTime && batch.endTime
      ? `${batch.startTime} – ${batch.endTime}`
      : null;

  return [days, time].filter(Boolean).join(" · ") || "Schedule to be announced";
}

export function CourseBatchCards({
  batches,
  isLoading,
  courseSlug,
  coursePrice,
  isFree,
}: Props) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-10 text-center">
        <p className="text-sm font-medium text-slate-700">
          No batches available right now
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Check back later for upcoming batches for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {batches.map((batch) => {
        const seatsLeft = Math.max(0, batch.capacity - batch.enrolledCount);
        const trainer = batch.trainers?.[0];
        const trainerName = trainer
          ? [trainer.firstName, trainer.lastName].filter(Boolean).join(" ")
          : null;

        return (
          <Card
            key={batch.id}
            className="flex h-full flex-col rounded-xl border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {batch.name}
                </h3>
                <p className="text-sm text-slate-500">{batch.code}</p>
              </div>
              <Badge variant="info">{batch.status}</Badge>
            </div>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                {batch.branch?.branchName ?? "—"}
              </p>
              <p className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                {formatDate(batch.startDate)} → {formatDate(batch.endDate)}
              </p>
              <p className="text-slate-500">{formatSchedule(batch)}</p>
              {trainerName ? (
                <p className="text-slate-500">Instructor: {trainerName}</p>
              ) : null}
              <p className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-500" />
                {seatsLeft} seats available
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
              <p className="text-lg font-bold text-slate-900">
                {isFree ? "Free" : formatCurrency(coursePrice)}
              </p>
              <Button
                size="sm"
                onClick={() =>
                  router.push(`/courses/${courseSlug}/enroll?batchId=${batch.id}`)
                }
              >
                Select Batch
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
