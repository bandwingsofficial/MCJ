"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { StudentBatchAttendanceDetail } from "@/src/features/branch-ops/types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

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

  const [monthFilter, setMonthFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await branchOpsApi.studentBatchAttendance(
        batchId,
        studentId,
      );
      setData(result);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(message ?? "Unable to load attendance details.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [batchId, studentId]);

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

  useEffect(() => {
    setPage(1);
  }, [monthFilter, sessionFilter, statusFilter]);

  const pagedHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, page, pageSize]);

  const monthOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const month of data?.monthly ?? []) {
      map.set(month.monthKey, month.label);
    }
    for (const row of data?.history ?? []) {
      const key = monthKeyFromIso(String(row.date));
      if (!map.has(key)) {
        const [year, month] = key.split("-").map(Number);
        const label = new Date(
          Date.UTC(year, (month || 1) - 1, 1),
        ).toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
          timeZone: "UTC",
        });
        map.set(key, label);
      }
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [data?.monthly, data?.history]);

  if (loading && !data) return <Loader />;
  if (error && !data) return <ErrorState description={error} onRetry={load} />;
  if (!data) return <EmptyState title="No attendance recorded yet." />;

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
          View-only attendance history for this student in the selected batch.
        </p>
      </div>

      <Card className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Field
          label="Student"
          value={`${data.student.name} (${data.student.studentCode})`}
        />
        <Field label="Branch" value={data.branch.branchName} />
        <Field
          label="Batch"
          value={`${data.batch.name} (${data.batch.code})`}
        />
        {focusRecord ? (
          <>
            <Field label="Session" value={focusRecord.session.label} />
            <Field label="Course" value={focusRecord.course.title} />
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#647A9B]">
                Current Status
              </p>
              <div className="mt-1">
                <Badge variant={attendanceStatusVariant(focusRecord.status)}>
                  {focusRecord.status}
                </Badge>
              </div>
            </div>
          </>
        ) : null}
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Student Attendance History
        </h2>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
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
          <button
            type="button"
            onClick={() => {
              setMonthFilter("");
              setSessionFilter("");
              setStatusFilter("");
              setPage(1);
            }}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear Filters
          </button>
        </div>

        {!data.history.length ? (
          <EmptyState title="No attendance recorded yet." />
        ) : !filteredHistory.length ? (
          <EmptyState title="No attendance matches these filters." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatAttendanceDisplayDate(String(item.date))}
                      </TableCell>
                      <TableCell className="max-w-[14rem] truncate font-medium">
                        {item.session.label}
                      </TableCell>
                      <TableCell className="max-w-[12rem] truncate">
                        {item.course.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attendanceStatusVariant(item.status)}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <TablePaginationBar
              page={page}
              pageSize={pageSize}
              total={filteredHistory.length}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
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
      <p className="mt-0.5 truncate text-sm font-medium text-[#102A56]">
        {value}
      </p>
    </div>
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
