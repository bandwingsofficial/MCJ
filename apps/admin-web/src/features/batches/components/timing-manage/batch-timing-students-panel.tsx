"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { BatchManageSection } from "@/src/features/batches/components/manage/batch-manage-section";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { EnrollmentStatus, SortOrder } from "@/src/features/enrollments/types/enrollment.enums";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { enrollmentManagePath } from "@/src/features/enrollments/utils/enrollment-manage.routes";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";

interface Props {
  timing: BatchTiming;
}

type StudentStatusFilter =
  | "ALL"
  | EnrollmentStatus.ADMITTED
  | EnrollmentStatus.CANCELLED;

const STUDENT_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: StudentStatusFilter;
}> = [
  { label: "Admitted", value: EnrollmentStatus.ADMITTED },
  { label: "Cancelled", value: EnrollmentStatus.CANCELLED },
  { label: "All", value: "ALL" },
];

const TIMING_STUDENT_STATUSES = new Set<EnrollmentStatus>([
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.CANCELLED,
]);

export function BatchTimingStudentsPanel({ timing }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StudentStatusFilter>(
    EnrollmentStatus.ADMITTED,
  );
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [admittedCount, setAdmittedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const trimmedSearch = search.trim();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const [admittedResponse, listResponse] = await Promise.all([
          enrollmentService.getEnrollments({
            batchTimingId: timing.id,
            status: EnrollmentStatus.ADMITTED,
            includeDeleted: false,
            skip: 0,
            take: 1,
          }),
          enrollmentService.getEnrollments({
            batchTimingId: timing.id,
            search: trimmedSearch || undefined,
            status:
              statusFilter === "ALL" ? undefined : statusFilter,
            includeDeleted: false,
            skip: 0,
            take: 100,
            sortBy: "createdAt",
            sortOrder: SortOrder.DESC,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const admittedTotal = parseEnrollmentListResponse(admittedResponse).total;
        let items = parseEnrollmentListResponse(listResponse).items;

        if (statusFilter === "ALL") {
          items = items.filter((enrollment) =>
            TIMING_STUDENT_STATUSES.has(enrollment.status),
          );
        }

        setAdmittedCount(admittedTotal);
        setEnrollments(items);
      } catch {
        if (!cancelled) {
          setAdmittedCount(0);
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
  }, [statusFilter, timing.id, trimmedSearch]);

  const availableSeats = useMemo(
    () => Math.max(0, timing.capacity - admittedCount),
    [admittedCount, timing.capacity],
  );

  const emptyTitle = useMemo(() => {
    if (trimmedSearch) {
      return "No students match your search.";
    }

    if (statusFilter === EnrollmentStatus.CANCELLED) {
      return "No cancelled students for this batch timing.";
    }

    if (statusFilter === "ALL") {
      return "No admitted or cancelled students for this batch timing.";
    }

    return "No admitted students assigned to this batch timing yet.";
  }, [statusFilter, trimmedSearch]);

  return (
    <BatchManageSection
      title="Students"
      description={`${admittedCount} enrolled · ${availableSeats} seats available · ${timing.capacity} capacity`}
    >
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1 sm:max-w-sm">
          <SearchInput
            value={search}
            placeholder="Search name, code, phone, or email"
            onChange={setSearch}
          />
        </div>
        <div className="w-full sm:w-44">
          <AppSelect
            value={statusFilter}
            options={STUDENT_STATUS_FILTER_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            onValueChange={(value) =>
              setStatusFilter(value as StudentStatusFilter)
            }
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : enrollments.length === 0 ? (
        <EmptyState title={emptyTitle} />
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
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-slate-600">
                  {enrollment.status}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() =>
                    router.push(enrollmentManagePath(enrollment.id))
                  }
                >
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </BatchManageSection>
  );
}
