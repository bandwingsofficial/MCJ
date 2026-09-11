"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";

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
  type AttendanceDatePreset,
  resolveAttendanceDateRange,
  todayLocalInput,
} from "@/src/features/enrollments/utils/attendance-date.utils";
import {
  initialCalendarMonth,
  monthRangeFromKey,
  type AttendanceCalendarDayMeta,
} from "@/src/features/enrollments/utils/attendance-calendar.utils";
import { BRANCH_COMPACT_SELECT_CLASS } from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import { BranchManagePaginationFooter } from "@/src/features/branches/components/manage/branch-manage-pagination-footer";
import {
  BranchManageTableShell,
  TABLE_CELL_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Input } from "@/src/shared/components/ui/input";
import { Loader } from "@/src/shared/components/ui/loader";
import { AppSelect } from "@/src/shared/components/ui/select";

interface Props {
  enrollment: Enrollment;
}

const HISTORY_COLUMNS = [
  { key: "date", label: "Date" },
  { key: "timing", label: "Timing" },
  { key: "course", label: "Course" },
  { key: "status", label: "Status" },
  { key: "marked", label: "Marked At" },
];

const DATE_PRESET_OPTIONS = [
  { label: "All Time", value: "ALL_TIME" },
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Custom", value: "CUSTOM" },
];

const STATUS_ALL_VALUE = "ALL";

const STATUS_OPTIONS = [
  { label: "All", value: STATUS_ALL_VALUE },
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Late", value: "LATE" },
];

const DEFAULT_PAGE_SIZE = 10;

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

  const [statusFilter, setStatusFilter] = useState(STATUS_ALL_VALUE);
  const [datePreset, setDatePreset] = useState<AttendanceDatePreset>("ALL_TIME");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(initialCalendarMonth);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const dateRange = useMemo(
    () => resolveAttendanceDateRange(datePreset, customFrom, customTo),
    [datePreset, customFrom, customTo],
  );

  const tableQueryParams = useMemo(() => {
    const params: Record<string, string | undefined> = {};
    if (statusFilter !== STATUS_ALL_VALUE) params.status = statusFilter;
    if (dateRange.from) params.from = dateRange.from;
    if (dateRange.to) params.to = dateRange.to;
    return params;
  }, [statusFilter, dateRange]);

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
  }, [statusFilter, datePreset, customFrom, customTo]);

  const data = tableData;
  const calendarViewData = calendarData ?? tableData;
  const history = data?.history ?? [];

  const pagedHistory = useMemo(() => {
    const start = (page - 1) * pageSize;
    return history.slice(start, start + pageSize);
  }, [history, page, pageSize]);

  const total = history.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(safePage * pageSize, total);

  const hasActiveFilters =
    statusFilter !== STATUS_ALL_VALUE || datePreset !== "ALL_TIME";

  if (loading && !data) {
    return (
      <Card className="rounded-xl border border-[#E1EBF5] bg-white p-6 shadow-sm">
        <Loader />
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Card className="rounded-xl border border-[#E1EBF5] bg-white p-6 shadow-sm">
        <ErrorState description={error} onRetry={loadTable} />
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="rounded-xl border border-[#E1EBF5] bg-white p-6 shadow-sm">
        <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
          <h3 className="text-base font-semibold text-[#102A56]">
            No attendance recorded yet
          </h3>
          <p className="mt-1 max-w-md text-sm text-[#647A9B]">
            Attendance records for this enrollment will appear here once marked.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
          Attendance
        </h2>
        <p className="text-xs text-[#647A9B] sm:text-[13px]">
          Attendance records for {enrollment.enrollmentNumber} (
          {formatEnrollmentOverviewContextLabel(enrollment)})
        </p>
      </div>

      <Card className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
          <h3 className="text-base font-semibold text-[#102A56]">
            Attendance Summary & Calendar
          </h3>
          <p className="mt-0.5 text-sm text-[#647A9B]">
            Review monthly attendance alongside session statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-xl border border-[#E8F0FA] bg-white p-4">
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
          </div>

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
      </Card>

      <Card className="min-w-0 overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
          <h3 className="text-base font-semibold text-[#102A56]">
            Attendance History
          </h3>
          <p className="mt-0.5 text-sm text-[#647A9B]">
            Filter and review attendance records for this enrollment.
          </p>
        </div>

        <div className="border-b border-[#E8F0FA] p-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center xl:gap-2">
            <div className="min-w-0">
              <AppSelect
                value={datePreset}
                triggerClassName={BRANCH_COMPACT_SELECT_CLASS}
                onValueChange={(value) => {
                  const preset = value as AttendanceDatePreset;
                  if (preset !== "CUSTOM") {
                    setDatePreset(preset);
                    setCustomFrom("");
                    setCustomTo("");
                    return;
                  }
                  const today = todayLocalInput();
                  setDatePreset(preset);
                  setCustomFrom(customFrom || today);
                  setCustomTo(customTo || today);
                }}
                options={DATE_PRESET_OPTIONS}
              />
            </div>
            <div className="min-w-0">
              <AppSelect
                value={statusFilter}
                triggerClassName={BRANCH_COMPACT_SELECT_CLASS}
                onValueChange={setStatusFilter}
                options={STATUS_OPTIONS}
              />
            </div>
            <div className="min-w-0">
              <Input
                type="date"
                className="h-9 w-full rounded-lg text-sm"
                value={
                  datePreset === "CUSTOM" ? customFrom : (dateRange.from ?? "")
                }
                disabled={datePreset !== "CUSTOM"}
                onChange={(event) => setCustomFrom(event.target.value)}
              />
            </div>
            <div className="min-w-0">
              <Input
                type="date"
                className="h-9 w-full rounded-lg text-sm"
                value={
                  datePreset === "CUSTOM" ? customTo : (dateRange.to ?? "")
                }
                disabled={datePreset !== "CUSTOM"}
                onChange={(event) => setCustomTo(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-full shrink-0 rounded-lg sm:col-span-2 xl:col-span-1 xl:w-auto xl:justify-self-end"
              disabled={!hasActiveFilters}
              onClick={() => {
                setStatusFilter(STATUS_ALL_VALUE);
                setDatePreset("ALL_TIME");
                setCustomFrom("");
                setCustomTo("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        <BranchManageTableShell
          columns={HISTORY_COLUMNS}
          isLoading={loading}
          isEmpty={!loading && total === 0}
          emptyTitle={
            hasActiveFilters
              ? "No attendance matches these filters"
              : "No attendance recorded yet"
          }
          emptyDescription="Attendance history for this enrollment will appear here."
          emptyIcon={CalendarDays}
          embedded
        >
          {pagedHistory.map((item) => (
            <tr
              key={item.id}
              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
            >
              <td className={`${TABLE_CELL_CLASS} whitespace-nowrap text-slate-700`}>
                {formatAttendanceDisplayDate(String(item.date))}
              </td>
              <td
                className={`${TABLE_CELL_CLASS} max-w-[12rem] truncate font-medium text-[#102A56]`}
              >
                {item.batchTiming?.name ?? data.batchTiming?.name ?? "—"}
              </td>
              <td className={`${TABLE_CELL_CLASS} max-w-[12rem] truncate text-slate-700`}>
                {item.course.title}
              </td>
              <td className={TABLE_CELL_CLASS}>
                <Badge variant={attendanceStatusVariant(item.status)}>
                  {item.status}
                </Badge>
              </td>
              <td className={`${TABLE_CELL_CLASS} whitespace-nowrap text-slate-700`}>
                {formatAttendanceMarkedAt(
                  item.markedAt ?? item.updatedAt ?? item.createdAt,
                )}
              </td>
            </tr>
          ))}
        </BranchManageTableShell>

        <BranchManagePaginationFooter
          from={from}
          to={to}
          total={total}
          page={safePage}
          pageSize={pageSize}
          totalPages={totalPages}
          disabled={loading}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      </Card>
    </div>
  );
}
