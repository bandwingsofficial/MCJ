"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { EnrollmentAttendanceDetail } from "@/src/features/enrollments/types/enrollment-attendance.types";
import {
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
} from "@/src/features/enrollments/utils/attendance-date.utils";
import {
  buildAttendanceCalendarDays,
  calendarDayCellClass,
  calendarDayCellStatusLines,
  currentMonthKey,
  formatMonthLabel,
  shiftMonthKey,
  summarizeDaySessions,
  type AttendanceCalendarDay,
  type AttendanceCalendarDayMeta,
} from "@/src/features/enrollments/utils/attendance-calendar.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  data: EnrollmentAttendanceDetail;
  monthKey: string;
  loading?: boolean;
  calendarDayMeta?: Map<string, AttendanceCalendarDayMeta>;
  onMonthChange: (monthKey: string) => void;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string | null) => void;
}

export function AttendanceCalendarView({
  data,
  monthKey,
  loading = false,
  calendarDayMeta,
  onMonthChange,
  selectedDateKey,
  onSelectDate,
}: Props) {
  const days = useMemo(
    () =>
      buildAttendanceCalendarDays({
        monthKey,
        startDate: data.batch.startDate,
        endDate: data.batch.endDate,
        history: data.history,
        calendarDayMeta,
      }),
    [
      monthKey,
      data.batch.startDate,
      data.batch.endDate,
      data.history,
      calendarDayMeta,
    ],
  );

  const selectedDay = useMemo(
    () => days.find((day) => day.dateKey === selectedDateKey) ?? null,
    [days, selectedDateKey],
  );

  const todayMonth = currentMonthKey();
  const showToday = monthKey !== todayMonth;

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-1">
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 shrink-0 p-0 hover:border-[#2563EB] hover:text-[#2563EB]"
            onClick={() => onMonthChange(shiftMonthKey(monthKey, -1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold text-[#102A56]">
            {formatMonthLabel(monthKey)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 shrink-0 p-0 hover:border-[#2563EB] hover:text-[#2563EB]"
            onClick={() => onMonthChange(shiftMonthKey(monthKey, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {showToday ? (
          <button
            type="button"
            onClick={() => onMonthChange(todayMonth)}
            className="text-xs font-medium text-[#2563EB] hover:underline"
          >
            Today
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Loading calendar...
        </p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => (
              <CalendarCell
                key={day.dateKey}
                day={day}
                selected={selectedDateKey === day.dateKey}
                onSelect={() =>
                  onSelectDate(
                    selectedDateKey === day.dateKey ? null : day.dateKey,
                  )
                }
              />
            ))}
          </div>
        </>
      )}

      {selectedDay?.sessions.length ? (
        <DateDetailPanel day={selectedDay} />
      ) : selectedDay ? (
        <p className="rounded-lg border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-500">
          {formatAttendanceDisplayDate(selectedDay.dateKey)} —{" "}
          {(() => {
            const { primary, secondary } =
              calendarDayCellStatusLines(selectedDay);
            return secondary ? `${primary} (${secondary})` : primary;
          })()}
          {selectedDay.sessions.length
            ? ""
            : ". No attendance records for this date."}
        </p>
      ) : null}
    </div>
  );
}

function CalendarCell({
  day,
  selected,
  onSelect,
}: {
  day: AttendanceCalendarDay;
  selected: boolean;
  onSelect: () => void;
}) {
  const { primary, secondary } = calendarDayCellStatusLines(day);
  const ariaLabel = secondary
    ? `${formatAttendanceDisplayDate(day.dateKey)}, ${primary}, ${secondary}`
    : `${formatAttendanceDisplayDate(day.dateKey)}, ${primary}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!day.inMonth}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "flex min-h-[4.5rem] flex-col items-center justify-start rounded-md border px-0.5 py-1 text-xs transition-colors",
        !day.inMonth && "invisible border-transparent",
        day.inMonth && calendarDayCellClass(day.dayType),
        selected && "ring-2 ring-[#2563EB] ring-offset-1",
      )}
    >
      <span className="text-sm font-semibold leading-none">{day.day}</span>
      <span className="mt-1 line-clamp-2 text-center text-[10px] font-medium leading-tight">
        {primary}
      </span>
      {secondary ? (
        <span className="line-clamp-2 text-center text-[9px] leading-tight opacity-80">
          {secondary}
        </span>
      ) : null}
    </button>
  );
}

function DateDetailPanel({ day }: { day: AttendanceCalendarDay }) {
  const totals = summarizeDaySessions(day.sessions);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-[#102A56]">
        {formatAttendanceDisplayDate(day.dateKey)}
      </p>
      <div className="mt-2 space-y-2">
        {day.sessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-[#102A56]">
                {session.sessionLabel}
              </p>
              <p className="truncate text-xs text-slate-500">
                {session.courseTitle}
              </p>
            </div>
            <Badge variant={attendanceStatusVariant(session.status)}>
              {session.status}
            </Badge>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Attendance: {totals.present} Present
        {totals.absent ? `, ${totals.absent} Absent` : ""}
        {totals.late ? `, ${totals.late} Late` : ""}
      </p>
    </div>
  );
}
