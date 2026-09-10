"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import type { BatchCalendarDayCell } from "@/src/features/batches/types/batch.types";
import {
  BATCH_CALENDAR_LEGEND,
  batchCalendarDayCellClass,
  batchCalendarDayLabel,
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

          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const isSelected = selectedDateKey === day.dateKey;
              const clickable = day.inMonth && day.isEditable;

              return (
                <button
                  key={day.dateKey}
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (clickable) onSelectDate(day.dateKey);
                  }}
                  className={cn(
                    "min-h-[4.5rem] rounded-lg border p-1 text-left transition",
                    day.inMonth
                      ? batchCalendarDayCellClass(day.dayType)
                      : "border-transparent bg-transparent text-transparent",
                    clickable && "hover:ring-2 hover:ring-[#2563EB]/40",
                    isSelected && "ring-2 ring-[#2563EB]",
                    !clickable && day.inMonth && "cursor-default",
                  )}
                >
                  {day.inMonth ? (
                    <>
                      <div className="text-sm font-semibold">{day.day}</div>
                      <div className="mt-1 text-[10px] leading-tight">
                        {batchCalendarDayLabel(day.dayType)}
                      </div>
                      {day.reason ? (
                        <div className="mt-1 line-clamp-2 text-[10px] opacity-80">
                          {day.reason}
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
