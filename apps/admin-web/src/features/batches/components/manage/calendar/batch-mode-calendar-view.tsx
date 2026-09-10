"use client";

import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

import type { BatchCalendarDayCell } from "@/src/features/batches/types/batch.types";
import {
  BATCH_CALENDAR_LEGEND,
  batchCalendarCellDisplayLabel,
  batchCalendarDayCellClass,
} from "@/src/features/batches/utils/batch-calendar-display.utils";
import { Button } from "@/src/shared/components/ui/button";
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
  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-1">
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 shrink-0 p-0"
            onClick={onPreviousMonth}
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="text-sm font-semibold text-[#102A56]">{monthLabel}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 shrink-0 p-0"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {showToday && onToday ? (
          <button
            type="button"
            onClick={onToday}
            className="text-xs font-medium text-[#2563EB] hover:underline"
          >
            Today
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {BATCH_CALENDAR_LEGEND.map((item) => (
          <div
            key={item.dayType}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium",
              batchCalendarDayCellClass(item.dayType),
            )}
          >
            {item.label}
          </div>
        ))}
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading calendar...</p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-500">
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
                onSelect={() => onSelectDate(day.dateKey)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CalendarDayCell({
  day,
  selected,
  onSelect,
}: {
  day: BatchCalendarDayCell;
  selected: boolean;
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
      className={cn(
        "group relative flex min-h-[5.25rem] flex-col rounded-xl border px-2 py-2 text-left shadow-sm transition-all",
        batchCalendarDayCellClass(day.dayType),
        clickable &&
          "cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-[#2563EB]/30",
        selected && "ring-2 ring-[#2563EB] ring-offset-1",
        !clickable && "cursor-default opacity-80",
      )}
    >
      {clickable ? (
        <span
          className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-white/80 text-slate-500 opacity-70 shadow-sm transition group-hover:opacity-100 group-hover:text-[#2563EB]"
          aria-hidden
        >
          <Pencil className="h-3 w-3" />
        </span>
      ) : null}

      <span className="pr-5 text-base font-semibold leading-none">{day.day}</span>

      <span className="mt-2 line-clamp-2 text-[10px] font-semibold uppercase tracking-wide leading-tight">
        {primary}
      </span>

      {secondary ? (
        <span className="mt-1 line-clamp-2 text-[10px] font-medium leading-tight opacity-90">
          {secondary}
        </span>
      ) : null}
    </button>
  );
}
