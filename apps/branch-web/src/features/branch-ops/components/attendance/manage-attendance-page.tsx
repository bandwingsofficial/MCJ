"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { AttendanceCalendarView } from "@/src/features/branch-ops/components/attendance/attendance-calendar-view";
import { AttendanceSummaryPanel } from "@/src/features/branch-ops/components/attendance/attendance-summary-panel";
import type { StudentBatchAttendanceDetail } from "@/src/features/branch-ops/types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import {
  initialCalendarMonth,
  monthRangeFromKey,
} from "@/src/features/branch-ops/utils/attendance-calendar.utils";
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

/** View-only attendance details / tracking page. */
export function AttendanceDetailsPage({
  batchId,
  studentId,
  recordId = null,
}: Props) {
  const role = useAuthStore((state) => state.user?.role);

  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<StudentBatchAttendanceDetail | null>(
    null,
  );
  const [calendarData, setCalendarData] =
    useState<StudentBatchAttendanceDetail | null>(null);

  const [sessionFilter, setSessionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(initialCalendarMonth);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tableQueryParams = useMemo(() => {
    const params: Record<string, string | undefined> = {};
    if (sessionFilter) params.batchCourseId = sessionFilter;
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [sessionFilter, statusFilter]);

  const calendarQueryParams = useMemo(() => {
    const range = monthRangeFromKey(calendarMonth);
    return {
      from: range.from,
      to: range.to,
      ...(sessionFilter ? { batchCourseId: sessionFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    };
  }, [calendarMonth, sessionFilter, statusFilter]);

  const loadTable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await branchOpsApi.studentBatchAttendance(
        batchId,
        studentId,
        tableQueryParams,
      );
      setTableData(result);
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : null;
      setError(message ?? "Unable to load attendance details.");
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [batchId, studentId, tableQueryParams]);

  const loadCalendar = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const result = await branchOpsApi.studentBatchAttendance(
        batchId,
        studentId,
        calendarQueryParams,
      );
      setCalendarData(result);
    } catch {
      setCalendarData(null);
    } finally {
      setCalendarLoading(false);
    }
  }, [batchId, studentId, calendarQueryParams]);

  useEffect(() => {
    void loadTable();
  }, [loadTable]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    setPage(1);
    setSelectedDateKey(null);
  }, [sessionFilter, statusFilter]);

  const data = tableData;
  const calendarViewData = calendarData ?? tableData;

  const focusRecord = useMemo(() => {
    if (!data?.history.length) return null;
    return (
      (recordId && data.history.find((row) => row.id === recordId)) ||
      data.history[0] ||
      null
    );
  }, [data?.history, recordId]);

  const history = data?.history ?? [];

  const pagedHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return history.slice(start, start + pageSize);
  }, [history, page, pageSize]);

  if (loading && !data) return <Loader />;
  if (error && !data) {
    return <ErrorState description={error} onRetry={loadTable} />;
  }
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
        <Field label="Student Code" value={data.student.studentCode} />
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

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
              setSessionFilter("");
              setStatusFilter("");
              setPage(1);
              setSelectedDateKey(null);
            }}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <Card className="p-4">
            {calendarViewData ? (
              <AttendanceCalendarView
                data={calendarViewData}
                monthKey={calendarMonth}
                loading={calendarLoading}
                onMonthChange={(monthKey) => {
                  setCalendarMonth(monthKey);
                  setSelectedDateKey(null);
                }}
                selectedDateKey={selectedDateKey}
                onSelectDate={setSelectedDateKey}
              />
            ) : (
              <Loader />
            )}
          </Card>
          <AttendanceSummaryPanel
            summary={
              calendarViewData?.summary ?? {
                workingDays: null,
                attendanceDates: 0,
                sessionsConducted: 0,
                present: 0,
                absent: 0,
                late: 0,
                leave: 0,
                attended: 0,
                percentage: null,
                ratioLabel: null,
                hasAttendance: false,
                totalRecords: 0,
              }
            }
          />
        </div>

        {!history.length ? (
          <EmptyState
            title={
              sessionFilter || statusFilter
                ? "No attendance matches these filters."
                : "No attendance recorded yet."
            }
          />
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
              total={history.length}
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
