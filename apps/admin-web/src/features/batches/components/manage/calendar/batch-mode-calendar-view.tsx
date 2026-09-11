"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

import type { BatchCalendarDayCell } from "@/src/features/batches/types/batch.types";
import {
  BATCH_CALENDAR_LEGEND,
  batchCalendarCellDisplayLabel,
  batchCalendarDayCellClass,
  batchCalendarLegendSwatchClass,
  currentCalendarDateKey,
} from "@/src/features/batches/utils/batch-calendar-display.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface Props {
  monthLabel: string;
  days: BatchCalendarDayCell[];
  loading?: boolean;
  selectedDateKey: string | null;
  onSelectDate: (dateKey: string) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday?: () => void;
  showToday?: boolean;
}

export function BatchModeCalendarView({
  monthLabel,
  days,
  loading = false,
  selectedDateKey,
  onSelectDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  showToday = false,
}: Props) {
  const todayKey = currentCalendarDateKey();

  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:justify-start">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 shrink-0 p-0 hover:border-[#2563EB] hover:text-[#2563EB]"
              onClick={onPreviousMonth}
              disabled={loading}
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-0 text-center">
              <p className="text-base font-semibold text-[#102A56]">{monthLabel}</p>
              <p className="mt-0.5 text-xs text-[#647A9B]">
                Select an editable date to manage holidays and exceptions.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 shrink-0 p-0 hover:border-[#2563EB] hover:text-[#2563EB]"
              onClick={onNextMonth}
              disabled={loading}
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {showToday && onToday ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToday}
              disabled={loading}
              className="shrink-0 border-[#C7D9F5] text-[#2563EB] hover:border-[#2563EB] hover:bg-blue-50"
            >
              Today
            </Button>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex flex-wrap gap-2">
          {BATCH_CALENDAR_LEGEND.map((item) => (
            <div
              key={item.dayType}
              className="inline-flex items-center gap-2 rounded-full border border-[#E1EBF5] bg-white px-2.5 py-1 text-[11px] font-medium text-[#647A9B] shadow-sm"
            >
              <span
                className={cn(
                  "h-3 w-3 shrink-0 rounded-full ring-1",
                  batchCalendarLegendSwatchClass(item.dayType),
                )}
                aria-hidden="true"
              />
              {item.label}
            </div>
          ))}
        </div>

        {loading ? (
          <CalendarSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-7 gap-1 rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/50 p-2 text-center text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
              {WEEKDAY_LABELS.map((label) => (
                <div key={label} className="py-1">
                  {label}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {days.map((day) => (
                <CalendarDayCell
                  key={day.dateKey}
                  day={day}
                  selected={selectedDateKey === day.dateKey}
                  isToday={day.inMonth && day.dateKey === todayKey}
                  onSelect={() => onSelectDate(day.dateKey)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full rounded-lg" />
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }).map((_, index) => (
          <Skeleton key={index} className="min-h-[5.25rem] rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function CalendarDayCell({
  day,
  selected,
  isToday,
  onSelect,
}: {
  day: BatchCalendarDayCell;
  selected: boolean;
  isToday: boolean;
  onSelect: () => void;
}) {
  const clickable = day.inMonth && day.isEditable;
  const { primary, secondary } = batchCalendarCellDisplayLabel(
    day.dayType,
    day.reason,
  );

  if (!day.inMonth) {
    return (
      <div
        aria-hidden
        className="min-h-[5.25rem] rounded-xl border border-transparent bg-transparent"
      />
    );
  }

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => {
        if (clickable) onSelect();
      }}
      aria-label={
        secondary
          ? `${day.day}, ${primary}, ${secondary}`
          : `${day.day}, ${primary}`
      }
      aria-current={isToday ? "date" : undefined}
      className={cn(
        "group relative flex min-h-[5.25rem] flex-col rounded-xl border px-2 py-2 text-left shadow-sm transition-all",
        batchCalendarDayCellClass(day.dayType),
        clickable &&
          "cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-[#2563EB]/20",
        selected && "ring-2 ring-[#2563EB] ring-offset-2",
        !selected &&
          isToday &&
          "ring-2 ring-[#2563EB]/40 ring-offset-1",
        !clickable && "cursor-default opacity-85",
      )}
    >
      {clickable ? (
        <span
          className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/85 text-slate-500 opacity-70 shadow-sm transition group-hover:opacity-100 group-hover:text-[#2563EB]"
          aria-hidden
        >
          <Pencil className="h-3 w-3" />
        </span>
      ) : null}

      <span
        className={cn(
          "pr-5 text-base font-semibold leading-none",
          isToday && "text-[#2563EB]",
        )}
      >
        {day.day}
      </span>

      {isToday ? (
        <span className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-[#2563EB]">
          Today
        </span>
      ) : null}

      <span className="mt-1 line-clamp-2 text-[10px] font-semibold uppercase tracking-wide leading-tight">
        {primary}
      </span>

      {secondary ? (
        <span className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-tight opacity-90">
          {secondary}
        </span>
      ) : null}
    </button>
  );
}
