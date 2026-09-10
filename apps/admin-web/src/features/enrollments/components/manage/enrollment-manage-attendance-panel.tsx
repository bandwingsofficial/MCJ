"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { batchApi } from "@/src/features/batches/api/batch.api";
import { AttendanceCalendarView } from "@/src/features/enrollments/components/manage/attendance/attendance-calendar-view";
import { AttendanceSummaryPanel } from "@/src/features/enrollments/components/manage/attendance/attendance-summary-panel";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { EnrollmentAttendanceDetail } from "@/src/features/enrollments/types/enrollment-attendance.types";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { formatEnrollmentOverviewContextLabel } from "@/src/features/enrollments/utils/enrollment-overview.utils";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
  formatAttendanceMarkedAt,
} from "@/src/features/enrollments/utils/attendance-date.utils";
import {
  initialCalendarMonth,
  monthRangeFromKey,
  type AttendanceCalendarDayMeta,
} from "@/src/features/enrollments/utils/attendance-calendar.utils";
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
  enrollment: Enrollment;
}

export function EnrollmentManageAttendancePanel({ enrollment }: Props) {
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableData, setTableData] = useState<EnrollmentAttendanceDetail | null>(
    null,
  );
  const [calendarData, setCalendarData] =
    useState<EnrollmentAttendanceDetail | null>(null);
  const [calendarDayMeta, setCalendarDayMeta] = useState<
    Map<string, AttendanceCalendarDayMeta>
  >(new Map());

  const [statusFilter, setStatusFilter] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(initialCalendarMonth);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const tableQueryParams = useMemo(() => {
    const params: Record<string, string | undefined> = {};
    if (statusFilter) params.status = statusFilter;
    return params;
  }, [statusFilter]);

  const calendarQueryParams = useMemo(() => {
    const range = monthRangeFromKey(calendarMonth);
    return {
      from: range.from,
      to: range.to,
    };
  }, [calendarMonth]);

  const loadTable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await enrollmentService.getEnrollmentAttendance(
        enrollment.id,
        tableQueryParams,
      );
      setTableData(result.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to load attendance details.";
      setError(message);
      setTableData(null);
    } finally {
      setLoading(false);
    }
  }, [enrollment.id, tableQueryParams]);

  const loadCalendar = useCallback(async () => {
    setCalendarLoading(true);
    try {
      const result = await enrollmentService.getEnrollmentAttendance(
        enrollment.id,
        calendarQueryParams,
      );
      setCalendarData(result.data);

      const batchId = result.data.batch.id;
      const mode = result.data.batchTiming?.mode;
      if (mode) {
        const calendarView = await batchApi.getBatchCalendarView(batchId, mode, {
          month: calendarMonth,
        });
        const dayMetaMap = new Map<string, AttendanceCalendarDayMeta>();
        for (const day of calendarView.data.days) {
          if (day.inMonth) {
            dayMetaMap.set(day.dateKey, {
              dayType: day.dayType,
              reason: day.reason,
            });
          }
        }
        setCalendarDayMeta(dayMetaMap);
      } else {
        setCalendarDayMeta(new Map());
      }
    } catch {
      setCalendarData(null);
      setCalendarDayMeta(new Map());
    } finally {
      setCalendarLoading(false);
    }
  }, [enrollment.id, calendarQueryParams, calendarMonth]);

  useEffect(() => {
    void loadTable();
  }, [loadTable]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    setPage(1);
    setSelectedDateKey(null);
  }, [statusFilter]);

  const data = tableData;
  const calendarViewData = calendarData ?? tableData;
  const history = data?.history ?? [];

  const pagedHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return history.slice(start, start + pageSize);
  }, [history, page, pageSize]);

  if (loading && !data) {
    return (
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <Loader />
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <ErrorState description={error} onRetry={loadTable} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <EmptyState title="No attendance recorded yet." />
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-[#102A56]">Attendance</h2>
      <p className="mt-1 text-sm text-[#647A9B]">
        Attendance records for {enrollment.enrollmentNumber} (
        {formatEnrollmentOverviewContextLabel(enrollment)})
      </p>

      <section className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Attendance Summary & Calendar
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
          <Card className="space-y-3 p-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
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
                  setStatusFilter("");
                  setPage(1);
                  setSelectedDateKey(null);
                }}
                className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Clear Filters
              </button>
            </div>

            {calendarViewData ? (
              <AttendanceCalendarView
                data={calendarViewData}
                monthKey={calendarMonth}
                loading={calendarLoading}
                calendarDayMeta={calendarDayMeta}
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
              tableData?.summary ??
              calendarViewData?.summary ?? {
                calendar: {
                  workingDays: 0,
                  sundays: 0,
                  holidays: 0,
                  nonWorkingDays: 0,
                  totalCalendarDays: 0,
                },
                attendance: {
                  totalSessions: 0,
                  attended: 0,
                  present: 0,
                  absent: 0,
                  late: 0,
                  percentage: null,
                  ratioLabel: null,
                },
              }
            }
          />
        </div>
      </section>

      <section className="mt-6 space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Attendance History
        </h3>

        {!history.length ? (
          <EmptyState
            title={
              statusFilter
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
                    <TableHead>Timing</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedHistory.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatAttendanceDisplayDate(String(item.date))}
                      </TableCell>
                      <TableCell className="max-w-[12rem] truncate font-medium text-[#102A56]">
                        {item.batchTiming?.name ?? data.batchTiming?.name ?? "—"}
                      </TableCell>
                      <TableCell className="max-w-[12rem] truncate">
                        {item.course.title}
                      </TableCell>
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
