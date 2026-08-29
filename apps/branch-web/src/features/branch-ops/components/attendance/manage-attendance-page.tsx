"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AttendanceSheet,
  StudentBatchAttendanceDetail,
} from "@/src/features/branch-ops/types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
  formatAttendanceMarkedAt,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  batchId: string;
  studentId: string;
  recordId?: string | null;
}

function monthKeyFromIso(date: string): string {
  return String(date).slice(0, 7);
}

/** View-only attendance details / tracking page. */
export function AttendanceDetailsPage({
  batchId,
  studentId,
  recordId = null,
}: Props) {
  const role = useAuthStore((state) => state.user?.role);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentBatchAttendanceDetail | null>(null);
  const [sheet, setSheet] = useState<AttendanceSheet | null>(null);

  const [monthFilter, setMonthFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await branchOpsApi.studentBatchAttendance(
        batchId,
        studentId,
      );
      setData(result);

      const focus =
        (recordId && result.history.find((row) => row.id === recordId)) ||
        result.history[0] ||
        null;

      if (focus) {
        const sheetData = await branchOpsApi.attendanceSheet({
          batchId,
          batchCourseId: focus.session.batchCourseId,
          date: String(focus.date).slice(0, 10),
        });
        setSheet(sheetData);
      } else {
        setSheet(null);
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(message ?? "Unable to load attendance details.");
      setData(null);
      setSheet(null);
    } finally {
      setLoading(false);
    }
  }, [batchId, studentId, recordId]);

  useEffect(() => {
    void load();
  }, [load]);

  const focusRecord = useMemo(() => {
    if (!data?.history.length) return null;
    return (
      (recordId && data.history.find((row) => row.id === recordId)) ||
      data.history[0] ||
      null
    );
  }, [data?.history, recordId]);

  const filteredHistory = useMemo(() => {
    const rows = data?.history ?? [];
    return rows.filter((row) => {
      if (monthFilter && monthKeyFromIso(String(row.date)) !== monthFilter) {
        return false;
      }
      if (sessionFilter && row.session.batchCourseId !== sessionFilter) {
        return false;
      }
      if (statusFilter && row.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [data?.history, monthFilter, sessionFilter, statusFilter]);

  const monthOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const month of data?.monthly ?? []) {
      map.set(month.monthKey, month.label);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [data?.monthly]);

  if (loading && !data) return <Loader />;
  if (error && !data) return <ErrorState description={error} onRetry={load} />;
  if (!data) return <EmptyState title="No attendance recorded yet." />;

  const summary = data.summary;
  const notStarted =
    !summary.hasAttendance || summary.sessionsConducted === 0;

  return (
    <div className="space-y-5">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-sm"
      >
        <Link href="/dashboard" className="text-[#647A9B] hover:text-[#2563EB]">
          {formatRoleLabel(role) || "Branch"}
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <Link
          href="/attendance"
          className="text-[#647A9B] hover:text-[#2563EB]"
        >
          Attendance
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-medium text-[#102A56]">Details</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#102A56]">
          Attendance Details
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View-only tracking for this student in the selected batch.
        </p>
      </div>

      <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Branch" value={data.branch.branchName} />
        <Field
          label="Batch"
          value={`${data.batch.name} (${data.batch.code})`}
        />
        <Field
          label="Student"
          value={`${data.student.name} (${data.student.studentCode})`}
        />
        {focusRecord ? (
          <>
            <Field label="Session" value={focusRecord.session.label} />
            <Field label="Course" value={focusRecord.course.title} />
            <Field
              label="Attendance Date"
              value={formatAttendanceDisplayDate(String(focusRecord.date))}
            />
          </>
        ) : null}
      </Card>

      {sheet ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Session Attendance ·{" "}
            {formatAttendanceDisplayDate(String(sheet.date))}
          </h2>
          <p className="text-sm text-slate-600">{sheet.session.label}</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span>
              Total: <strong>{sheet.summary.total}</strong>
            </span>
            <span>
              Present:{" "}
              <strong className="text-emerald-700">{sheet.summary.present}</strong>
            </span>
            <span>
              Absent:{" "}
              <strong className="text-rose-700">{sheet.summary.absent}</strong>
            </span>
            <span>
              Late:{" "}
              <strong className="text-amber-700">{sheet.summary.late}</strong>
            </span>
            <span>
              Attendance: <strong>{sheet.summary.percentage}%</strong>
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Student Code</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sheet.students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-[#102A56]">
                      {student.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {student.studentCode}
                    </TableCell>
                    <TableCell>
                      {student.status ? (
                        <Badge
                          variant={attendanceStatusVariant(student.status)}
                        >
                          {student.status}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Student Attendance Overview
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Total Sessions" value={String(summary.sessionsConducted)} />
          <Stat label="Present" value={String(summary.present)} />
          <Stat label="Absent" value={String(summary.absent)} />
          <Stat label="Late" value={String(summary.late)} />
          <Stat
            label="Attendance %"
            value={
              notStarted || summary.percentage == null
                ? "Not Started"
                : `${summary.percentage}%`
            }
            emphasize
          />
        </div>
        <p className="text-sm text-slate-600">
          {notStarted || !summary.ratioLabel
            ? "Not Started"
            : `${summary.ratioLabel} Sessions Attended`}
        </p>
      </section>

      {data.monthly.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Monthly Attendance
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.monthly.map((month) => (
              <Card key={month.monthKey} className="p-3">
                <p className="text-sm font-semibold text-slate-900">
                  {month.label}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Present {month.present} · Absent {month.absent} · Late{" "}
                  {month.late} · Conducted {month.conductedSessions}
                </p>
                <p className="mt-1 text-sm font-semibold text-[#2563EB]">
                  {month.percentage == null
                    ? "Not Started"
                    : `${month.percentage}%`}
                  {month.ratioLabel ? ` · ${month.ratioLabel}` : ""}
                </p>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Student Attendance History
        </h2>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
          <FilterSelect
            value={monthFilter}
            onChange={setMonthFilter}
            emptyLabel="All Months"
            options={monthOptions.map(([value, label]) => ({ value, label }))}
          />
          <FilterSelect
            value={sessionFilter}
            onChange={setSessionFilter}
            emptyLabel="All Sessions"
            options={(data.courses ?? []).map((course) => ({
              value: course.batchCourseId,
              label: course.label,
            }))}
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            emptyLabel="All Status"
            options={[
              { value: "PRESENT", label: "Present" },
              { value: "ABSENT", label: "Absent" },
              { value: "LATE", label: "Late" },
            ]}
          />
        </div>

        {!data.history.length ? (
          <EmptyState title="No attendance recorded yet." />
        ) : !filteredHistory.length ? (
          <EmptyState title="No attendance matches these filters." />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatAttendanceDisplayDate(String(item.date))}
                    </TableCell>
                    <TableCell className="max-w-[14rem] truncate font-medium">
                      {item.session.label}
                    </TableCell>
                    <TableCell>{item.course.title}</TableCell>
                    <TableCell>
                      <Badge variant={attendanceStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatAttendanceMarkedAt(
                        item.markedAt ?? item.updatedAt ?? item.createdAt,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}

/** @deprecated Use AttendanceDetailsPage */
export const ManageAttendancePage = AttendanceDetailsPage;

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <Card className="p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 text-lg font-semibold tabular-nums",
          emphasize ? "text-[#2563EB]" : "text-slate-900",
        )}
      >
        {value}
      </p>
    </Card>
  );
}

function FilterSelect({
  value,
  onChange,
  emptyLabel,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  emptyLabel: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-700"
    >
      <option value="">{emptyLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
