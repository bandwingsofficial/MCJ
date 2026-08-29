"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { StatCard } from "@/src/features/branch-ops/components/stat-card";
import type { BatchAttendanceStudentRow } from "@/src/features/branch-ops/types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import { formatBatchStatus } from "@/src/features/branch-ops/utils/batch-display";
import { Badge } from "@/src/shared/components/ui/badge";
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

interface Props {
  batchId: string;
}

function AttendanceBar({ percentage }: { percentage: number | null }) {
  if (percentage == null) {
    return <span className="text-xs text-slate-400">Not Started</span>;
  }
  const width = Math.max(0, Math.min(100, percentage));
  return (
    <div className="flex min-w-[7.5rem] items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#2563EB]"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs font-medium text-slate-700">
        {percentage}%
      </span>
    </div>
  );
}

export function BatchAttendancePanel({ batchId }: Props) {
  const [search, setSearch] = useState("");

  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batchAttendanceSummary(batchId),
    [batchId],
  );

  const students = useMemo(() => {
    const items = data?.students ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((student) => {
      const haystack = [student.name, student.studentCode, student.status]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [data?.students, search]);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <EmptyState title="Unable to load attendance." />;

  const { overview } = data;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-slate-900">
          Attendance Overview
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Working days, conducted sessions, and student attendance for this
          batch.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Working Days" value={overview.workingDays ?? "—"} />
        <StatCard
          label="Sessions Conducted"
          value={overview.sessionsConducted}
        />
        <StatCard label="Total Students" value={overview.enrolledStudents} />
        <StatCard
          label="Attendance Records"
          value={overview.totalAttendanceRecords}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Present" value={overview.present} />
        <StatCard label="Absent" value={overview.absent} />
        <StatCard label="Late" value={overview.late} />
        <StatCard
          label="Overall Attendance"
          value={
            overview.averageAttendance == null
              ? "No Attendance"
              : `${overview.averageAttendance}%`
          }
          hint="Average of students with attendance"
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Student Attendance
          </h3>
          <SearchInput
            value={search}
            placeholder="Search students..."
            onChange={(value) => setSearch(value)}
            className="sm:max-w-xs"
          />
        </div>

        {!overview.enrolledStudents ? (
          <EmptyState title="No students enrolled in this batch." />
        ) : !students.length ? (
          <EmptyState title="No students match your search." />
        ) : (
          <div className="space-y-3">
            {!overview.sessionsConducted ? (
              <p className="text-sm text-slate-500">
                No attendance records yet. Students will show as Not Started
                until sessions are conducted.
              </p>
            ) : null}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student Code</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Present</TableHead>
                    <TableHead>Absent</TableHead>
                    <TableHead>Late</TableHead>
                    <TableHead>Attendance %</TableHead>
                    <TableHead>Last Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <StudentAttendanceRow
                      key={student.id}
                      batchId={batchId}
                      student={student}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StudentAttendanceRow({
  batchId,
  student,
}: {
  batchId: string;
  student: BatchAttendanceStudentRow;
}) {
  return (
    <TableRow>
      <TableCell className="font-medium text-slate-900">
        {student.name}
      </TableCell>
      <TableCell className="text-slate-600">{student.studentCode}</TableCell>
      <TableCell className="tabular-nums text-slate-700">
        {student.hasAttendance && student.ratioLabel
          ? student.ratioLabel
          : "No Attendance"}
      </TableCell>
      <TableCell>{student.present}</TableCell>
      <TableCell>{student.absent}</TableCell>
      <TableCell>{student.late}</TableCell>
      <TableCell>
        <AttendanceBar percentage={student.percentage} />
      </TableCell>
      <TableCell>
        {student.lastAttendanceDate ? (
          <div className="space-y-1">
            <p className="text-sm text-slate-700">
              {formatAttendanceDisplayDate(student.lastAttendanceDate)}
            </p>
            {student.lastAttendanceStatus ? (
              <Badge
                variant={attendanceStatusVariant(student.lastAttendanceStatus)}
              >
                {student.lastAttendanceStatus}
              </Badge>
            ) : null}
          </div>
        ) : (
          <span className="text-slate-400">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant="default">{formatBatchStatus(student.status)}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Link
          href={`/attendance/details/${batchId}/${student.id}`}
          className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-[#2563EB] hover:bg-sky-50"
        >
          Details
        </Link>
      </TableCell>
    </TableRow>
  );
}
