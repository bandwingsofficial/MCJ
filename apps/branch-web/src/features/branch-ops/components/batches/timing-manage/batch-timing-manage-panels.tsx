"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { EnrollmentStatusBadge } from "@/src/features/enrollments/components/enrollment-status-badge";
import {
  BatchManageField,
  BatchManageSection,
} from "@/src/features/branch-ops/components/batches/manage/batch-manage-section";
import { BatchModeBadge } from "@/src/features/branch-ops/components/batches/batch-mode-badge";
import { BatchStatusBadge } from "@/src/features/branch-ops/components/batches/batch-status-badge";
import type {
  BatchListItem,
  BatchTimingListItem,
  EnrollmentItem,
} from "@/src/features/branch-ops/types";
import { courseTitle, studentName } from "@/src/features/branch-ops/utils/batch-display";
import {
  formatBatchDuration,
  formatBatchDurationType,
  formatBatchOverviewDate,
  formatBatchTimeLabel,
  formatTimingDays,
  formatTimingRange,
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/branch-ops/utils/batch-timing.utils";
import {
  DEFAULT_PAGE_SIZE,
  paginationParams,
} from "@/src/features/branch-ops/utils/pagination.utils";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

interface OverviewProps {
  batch: BatchListItem;
  timing: BatchTimingListItem;
}

export function BatchTimingOverviewPanel({ batch, timing }: OverviewProps) {
  const enrolledCount = getTimingEnrolledCount(timing);
  const availableSeats = getTimingAvailableSeats(timing);

  return (
    <div className="space-y-4">
      <BatchManageSection title="Batch Timing Overview">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField label="Batch Timing" value={timing.name} />
          <BatchManageField
            label="Mode"
            value={<BatchModeBadge mode={timing.mode} />}
          />
          <BatchManageField
            label="Batch Days"
            value={formatTimingDays(timing.daysOfWeek)}
          />
          <BatchManageField label="Timing" value={formatTimingRange(timing)} />
          <BatchManageField
            label="Start Date"
            value={formatBatchOverviewDate(timing.startDate)}
          />
          <BatchManageField
            label="End Date"
            value={formatBatchOverviewDate(timing.endDate)}
          />
          <BatchManageField label="Capacity" value={String(timing.capacity)} />
          <BatchManageField
            label="Enrolled"
            value={`${enrolledCount} Student${enrolledCount === 1 ? "" : "s"}`}
          />
          <BatchManageField
            label="Available Seats"
            value={String(availableSeats)}
          />
          <BatchManageField
            label="Status"
            value={
              <BatchStatusBadge
                status={timing.status}
                isActive={timing.isActive}
              />
            }
          />
        </dl>
      </BatchManageSection>

      <BatchManageSection
        title="Parent Batch"
        description="Course and batch this timing belongs to."
      >
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BatchManageField label="Course" value={courseTitle(batch.course)} />
          <BatchManageField label="Batch Name" value={batch.name} />
          <BatchManageField label="Batch Number" value={batch.code} />
        </dl>
      </BatchManageSection>
    </div>
  );
}

export function BatchTimingBatchDetailsPanel({
  batch,
  timing,
}: OverviewProps) {
  const enrolledCount = getTimingEnrolledCount(timing);
  const availableSeats = getTimingAvailableSeats(timing);

  return (
    <BatchManageSection
      title="Batch Details"
      description="Parent batch and selected batch timing information."
    >
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BatchManageField label="Batch Name" value={batch.name} />
        <BatchManageField label="Batch Number" value={batch.code} />
        <BatchManageField label="Course" value={courseTitle(batch.course)} />
        <BatchManageField
          label="Learning Mode"
          value={<BatchModeBadge mode={timing.mode} />}
        />
        <BatchManageField
          label="Duration"
          value={formatBatchDuration(batch)}
        />
        <BatchManageField
          label="Duration Type"
          value={formatBatchDurationType(batch)}
        />
        <BatchManageField
          label="Start Date"
          value={formatBatchOverviewDate(timing.startDate)}
        />
        <BatchManageField
          label="End Date"
          value={formatBatchOverviewDate(timing.endDate)}
        />
        <BatchManageField
          label="Status"
          value={
            <BatchStatusBadge
              status={timing.status}
              isActive={timing.isActive}
            />
          }
        />
        <BatchManageField label="Timing" value={formatTimingRange(timing)} />
        <BatchManageField
          label="Batch Days"
          value={formatTimingDays(timing.daysOfWeek)}
        />
        <BatchManageField label="Capacity" value={String(timing.capacity)} />
        <BatchManageField label="Enrolled" value={String(enrolledCount)} />
        <BatchManageField
          label="Available Seats"
          value={String(availableSeats)}
        />
      </dl>
    </BatchManageSection>
  );
}

export function BatchTimingDetailsPanel({ timing }: { timing: BatchTimingListItem }) {
  return (
    <BatchManageSection
      title="Batch Timing"
      description="Schedule details for this timing."
    >
      <dl className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BatchManageField label="Batch Timing Name" value={timing.name} />
        <BatchManageField
          label="Mode"
          value={<BatchModeBadge mode={timing.mode} />}
        />
        <BatchManageField
          label="Batch Days"
          value={formatTimingDays(timing.daysOfWeek)}
        />
        <BatchManageField label="Timing" value={formatTimingRange(timing)} />
        <BatchManageField
          label="Start Date"
          value={formatBatchOverviewDate(timing.startDate)}
        />
        <BatchManageField
          label="End Date"
          value={formatBatchOverviewDate(timing.endDate)}
        />
        <BatchManageField
          label="Start Time"
          value={formatBatchTimeLabel(timing.startTime)}
        />
        <BatchManageField
          label="End Time"
          value={formatBatchTimeLabel(timing.endTime)}
        />
        <BatchManageField label="Capacity" value={String(timing.capacity)} />
        <BatchManageField
          label="Enrolled"
          value={String(getTimingEnrolledCount(timing))}
        />
        <BatchManageField
          label="Available Seats"
          value={String(getTimingAvailableSeats(timing))}
        />
        <BatchManageField
          label="Status"
          value={
            <BatchStatusBadge
              status={timing.status}
              isActive={timing.isActive}
            />
          }
        />
      </dl>
    </BatchManageSection>
  );
}

type StudentStatusFilter = "ALL" | "ADMITTED" | "CANCELLED";

const STUDENT_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: StudentStatusFilter;
}> = [
  { label: "Admitted", value: "ADMITTED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "All", value: "ALL" },
];

const TIMING_STUDENT_STATUS_IN = "ADMITTED,CANCELLED";

function formatBranchLabel(
  branch?: EnrollmentItem["branch"] | null,
): string {
  if (!branch?.branchName) {
    return "—";
  }

  return branch.branchCode
    ? `${branch.branchName} (${branch.branchCode})`
    : branch.branchName;
}

function timingStudentListParams(
  batchId: string,
  timingId: string,
  statusFilter: StudentStatusFilter,
  trimmedSearch: string,
  page: number,
  pageSize: number,
) {
  const { skip, take } = paginationParams(page, pageSize);

  return {
    batchId,
    batchTimingId: timingId,
    search: trimmedSearch || undefined,
    ...(statusFilter === "ALL"
      ? { statusIn: TIMING_STUDENT_STATUS_IN }
      : { status: statusFilter }),
    skip,
    take,
  };
}

interface StudentsProps {
  batchId: string;
  timing: BatchTimingListItem;
}

export function BatchTimingStudentsPanel({ batchId, timing }: StudentsProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StudentStatusFilter>("ADMITTED");
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [admittedCount, setAdmittedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);

  const trimmedSearch = search.trim();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [admittedPage, listPage] = await Promise.all([
          branchOpsApi.enrollments({
            batchId,
            batchTimingId: timing.id,
            status: "ADMITTED",
            skip: 0,
            take: 1,
          }),
          branchOpsApi.enrollments(
            timingStudentListParams(
              batchId,
              timing.id,
              statusFilter,
              trimmedSearch,
              page,
              pageSize,
            ),
          ),
        ]);

        if (cancelled) {
          return;
        }

        setAdmittedCount(admittedPage.count ?? 0);
        setTotalCount(listPage.count ?? 0);
        setEnrollments(listPage.items ?? []);
      } catch (err) {
        if (!cancelled) {
          setAdmittedCount(0);
          setTotalCount(0);
          setEnrollments([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load students for this batch timing.",
          );
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
  }, [
    batchId,
    page,
    pageSize,
    reloadNonce,
    statusFilter,
    timing.id,
    trimmedSearch,
  ]);

  const availableSeats = useMemo(
    () => Math.max(0, timing.capacity - admittedCount),
    [admittedCount, timing.capacity],
  );

  const emptyTitle = useMemo(() => {
    if (trimmedSearch) {
      return "No students match your search.";
    }

    if (statusFilter === "CANCELLED") {
      return "No cancelled students for this batch timing.";
    }

    if (statusFilter === "ALL") {
      return "No admitted or cancelled students for this batch timing.";
    }

    return "No admitted students assigned to this batch timing yet.";
  }, [statusFilter, trimmedSearch]);

  if (error && !isLoading && enrollments.length === 0) {
    return (
      <ErrorState
        description={error}
        onRetry={() => {
          setError(null);
          setReloadNonce((value) => value + 1);
        }}
      />
    );
  }

  return (
    <BatchManageSection
      title="Students"
      description={`${admittedCount} enrolled · ${availableSeats} seats available · ${timing.capacity} capacity`}
    >
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1 sm:max-w-sm">
            <SearchInput
              value={search}
              placeholder="Search name, code, phone, or email"
              className="h-[46px] rounded-xl"
              onChange={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-44">
            <AppSelect
              value={statusFilter}
              options={STUDENT_STATUS_FILTER_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              onValueChange={(value) => {
                setStatusFilter(value as StudentStatusFilter);
                setPage(1);
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#E1EBF5] bg-white">
            {!enrollments.length ? (
              <EmptyState title={emptyTitle} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student name</TableHead>
                    <TableHead>Student code</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell className="min-w-[140px] font-medium text-[#102A56]">
                        {studentName(enrollment.student)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-slate-700">
                        {enrollment.student.studentCode}
                      </TableCell>
                      <TableCell
                        className="max-w-[160px] truncate text-sm text-slate-700"
                        title={formatBranchLabel(enrollment.branch)}
                      >
                        {formatBranchLabel(enrollment.branch)}
                      </TableCell>
                      <TableCell
                        className="max-w-[180px] truncate text-sm text-slate-700"
                        title={enrollment.student.email ?? undefined}
                      >
                        {enrollment.student.email ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-700">
                        {enrollment.student.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <EnrollmentStatusBadge status={enrollment.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/students/${enrollment.student.id}`}
                          className="text-sm font-medium text-[#2563EB] hover:underline"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            <TablePaginationBar
              page={page}
              pageSize={pageSize}
              total={totalCount}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          </div>
        )}
      </div>
    </BatchManageSection>
  );
}
