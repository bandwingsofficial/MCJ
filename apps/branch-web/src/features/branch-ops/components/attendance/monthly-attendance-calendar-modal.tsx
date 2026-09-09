"use client";

import { useMemo } from "react";

import type { AttendanceItem } from "@/src/features/branch-ops/types";
import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
import { currentMonthKey } from "@/src/features/branch-ops/utils/attendance-calendar.utils";
import {
  buildMonthlyCalendarDays,
  currentMonthlyAttendanceLabel,
  type MonthlyCalendarDay,
  type MonthlyCalendarDayStatus,
} from "@/src/features/branch-ops/utils/monthly-attendance.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Modal } from "@/src/shared/components/ui/model";
import { cn } from "@/src/shared/lib/cn";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  open: boolean;
  onClose: () => void;
  studentName: string;
  studentCode: string;
  monthFrom: string;
  monthTo: string;
  enrollmentDate?: string | null;
  sessionDates: string[];
  records: AttendanceItem[];
  studentId: string;
}

const STATUS_META: Record<
  Exclude<MonthlyCalendarDayStatus, "OUT_OF_RANGE">,
  {
    label: string;
    dotClass: string;
    badgeVariant: "success" | "danger" | "warning" | "default" | "info";
  }
> = {
  PRESENT: {
    label: "Present",
    dotClass: "bg-emerald-500",
    badgeVariant: "success",
  },
  ABSENT: { label: "Absent", dotClass: "bg-red-500", badgeVariant: "danger" },
  LATE: { label: "Late", dotClass: "bg-amber-400", badgeVariant: "warning" },
  NO_SESSION: {
    label: "No Session",
    dotClass: "bg-slate-300",
    badgeVariant: "default",
  },
  FUTURE: {
    label: "Future",
    dotClass: "bg-slate-200",
    badgeVariant: "info",
  },
};

export function MonthlyAttendanceCalendarModal({
  open,
  onClose,
  studentName,
  studentCode,
  monthFrom,
  monthTo,
  enrollmentDate,
  sessionDates,
  records,
  studentId,
}: Props) {
  const monthKey = currentMonthKey();
  const days = useMemo(
    () =>
      buildMonthlyCalendarDays({
        monthKey,
        monthFrom,
        monthTo,
        enrollmentDate,
        sessionDates,
        records,
        studentId,
      }),
    [
      monthKey,
      monthFrom,
      monthTo,
      enrollmentDate,
      sessionDates,
      records,
      studentId,
    ],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Monthly Attendance Calendar"
      description={
        <span>
          {studentName} ({studentCode}) · {currentMonthlyAttendanceLabel()}
        </span>
      }
      contentClassName="max-w-3xl"
    >
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="py-1">
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => (
            <CalendarCell key={day.dateKey} day={day} />
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Legend
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map(
              (status) => (
                <Badge key={status} variant={STATUS_META[status].badgeVariant}>
                  <span
                    className={cn(
                      "mr-1.5 inline-block h-2 w-2 rounded-full",
                      STATUS_META[status].dotClass,
                    )}
                    aria-hidden="true"
                  />
                  {STATUS_META[status].label}
                </Badge>
              ),
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function CalendarCell({ day }: { day: MonthlyCalendarDay }) {
  if (!day.inMonth) {
    return <div className="invisible min-h-[52px]" aria-hidden="true" />;
  }

  if (day.status === "OUT_OF_RANGE") {
    return (
      <div className="flex min-h-[52px] flex-col items-center justify-start rounded-md border border-transparent px-0.5 py-1 text-xs text-slate-300">
        <span>{day.day}</span>
      </div>
    );
  }

  const meta = STATUS_META[day.status];
  const ariaLabel = `${formatAttendanceDisplayDate(day.dateKey)}, ${meta.label}`;

  return (
    <div
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "flex min-h-[52px] flex-col items-center justify-start rounded-md border px-0.5 py-1 text-xs",
        day.status === "FUTURE" && "border-slate-100 bg-white text-slate-400",
        day.status === "NO_SESSION" &&
          "border-slate-200 bg-slate-50 text-slate-500",
        (day.status === "PRESENT" ||
          day.status === "ABSENT" ||
          day.status === "LATE") &&
          "border-slate-200 bg-white text-[#102A56]",
      )}
    >
      <span className="font-medium">{day.day}</span>
      <span
        className={cn("mt-1 h-2 w-2 rounded-full", meta.dotClass)}
        aria-hidden="true"
      />
      <span className="mt-1 text-[10px] leading-none text-slate-500">
        {meta.label}
      </span>
    </div>
  );
}
