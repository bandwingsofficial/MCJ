"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  BatchManageField,
  BatchManageSection,
} from "@/src/features/branch-ops/components/batches/manage/batch-manage-section";
import { BatchModeBadge } from "@/src/features/branch-ops/components/batches/batch-mode-badge";
import { BatchStatusBadge } from "@/src/features/branch-ops/components/batches/batch-status-badge";
import type {
  BatchListItem,
  BatchTimingListItem,
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
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

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

interface StudentsProps {
  batchId: string;
  timingId: string;
}

export function BatchTimingStudentsPanel({ batchId, timingId }: StudentsProps) {
  const [search, setSearch] = useState("");
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batchStudents(batchId),
    [batchId],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const items = (data ?? []).filter(
      (student) => student.batchTiming?.id === timingId,
    );

    if (!term) {
      return items;
    }

    return items.filter((student) => {
      const haystack = [
        student.firstName,
        student.lastName,
        student.studentCode,
        student.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [data, search, timingId]);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <BatchManageSection
      title="Students"
      description="Enrollments linked to this batch timing."
    >
      <div className="space-y-4">
        <SearchInput
          value={search}
          placeholder="Search students..."
          className="h-[46px] rounded-xl sm:max-w-sm"
          onChange={setSearch}
        />

        {!filtered.length ? (
          <EmptyState title="No students are enrolled in this batch timing." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((student) => (
                  <TableRow key={student.enrollmentId}>
                    <TableCell className="font-mono text-sm">
                      {student.studentCode}
                    </TableCell>
                    <TableCell>{studentName(student)}</TableCell>
                    <TableCell>{student.enrollmentStatus ?? student.status}</TableCell>
                    <TableCell>
                      {student.attendance
                        ? `${student.attendance.percentage ?? 0}%`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-sm font-medium text-[#2563EB] hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </BatchManageSection>
  );
}
