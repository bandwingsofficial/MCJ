"use client";

import { useEffect, useState } from "react";

import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { BatchManageSection } from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";
import {
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/batches/utils/batch-timing.utils";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { SortOrder } from "@/src/features/enrollments/types/enrollment.enums";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";

interface Props {
  timing: BatchTiming;
}

export function BatchTimingStudentsPanel({ timing }: Props) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await enrollmentService.getEnrollments({
          batchTimingId: timing.id,
          includeDeleted: false,
          skip: 0,
          take: 100,
          sortBy: "createdAt",
          sortOrder: SortOrder.DESC,
        });
        if (!cancelled) {
          setEnrollments(
            parseEnrollmentListResponse(response).items,
          );
        }
      } catch {
        if (!cancelled) {
          setEnrollments([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [timing.id]);

  const enrolledCount = getTimingEnrolledCount(timing);
  const availableSeats = getTimingAvailableSeats(timing);

  return (
    <BatchManageSection
      title="Students"
      description={`${enrolledCount} enrolled · ${availableSeats} seats available · ${timing.capacity} capacity`}
    >
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : enrollments.length === 0 ? (
        <EmptyState title="No students assigned to this batch timing yet." />
      ) : (
        <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-[#102A56]">
                  {formatPersonName(
                    enrollment.student?.firstName,
                    enrollment.student?.lastName,
                  )}
                </p>
                <p className="text-xs text-slate-500">
                  {enrollment.student?.studentCode ?? "—"} ·{" "}
                  {enrollment.enrollmentNumber}
                </p>
              </div>
              <p className="text-xs font-medium text-slate-600">
                {enrollment.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </BatchManageSection>
  );
}
