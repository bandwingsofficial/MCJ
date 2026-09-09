"use client";

import {
  type AttendanceDatePreset,
  resolveAttendanceDateRange,
  todayLocalInput,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";

const DATE_PRESET_OPTIONS: Array<{
  label: string;
  value: AttendanceDatePreset;
}> = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Custom", value: "CUSTOM" },
];

const FILTER_H = "h-[46px]";
const FILTER_RADIUS = "rounded-xl";
const FILTER_TRIGGER = `${FILTER_H} ${FILTER_RADIUS} w-full min-w-0 text-sm [&>span]:line-clamp-1 [&>span]:text-left`;

export type AttendanceDateRangeFilterState = {
  datePreset: AttendanceDatePreset;
  from: string;
  to: string;
};

export const defaultAttendanceDateRangeFilters =
  (): AttendanceDateRangeFilterState => ({
    datePreset: "TODAY",
    from: "",
    to: "",
  });

export function resolveDateRangeFromFilters(
  filters: AttendanceDateRangeFilterState,
) {
  return resolveAttendanceDateRange(
    filters.datePreset,
    filters.from,
    filters.to,
  );
}

interface Props {
  filters: AttendanceDateRangeFilterState;
  onChange: (patch: Partial<AttendanceDateRangeFilterState>) => void;
  showClear?: boolean;
  onClear?: () => void;
}

export function AttendanceDateRangeFilters({
  filters,
  onChange,
  showClear = false,
  onClear,
}: Props) {
  const dateRange = resolveDateRangeFromFilters(filters);
  const isCustomDateRange = filters.datePreset === "CUSTOM";

  return (
    <div
      className={`grid grid-cols-1 gap-3 lg:items-end ${
        showClear
          ? "sm:grid-cols-2 lg:grid-cols-4"
          : "sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
          Date Range
        </label>
        <AppSelect
          value={filters.datePreset}
          triggerClassName={FILTER_TRIGGER}
          onValueChange={(value) => {
            const preset = value as AttendanceDatePreset;
            if (preset !== "CUSTOM") {
              onChange({ datePreset: preset, from: "", to: "" });
              return;
            }
            const today = todayLocalInput();
            onChange({
              datePreset: preset,
              from: filters.from || today,
              to: filters.to || today,
            });
          }}
          options={DATE_PRESET_OPTIONS}
        />
      </div>

      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
          Date From
        </label>
        <Input
          type="date"
          aria-label="Date from"
          className={`${FILTER_H} ${FILTER_RADIUS} w-full text-sm`}
          value={isCustomDateRange ? filters.from : (dateRange.from ?? "")}
          disabled={!isCustomDateRange}
          onChange={(event) => onChange({ from: event.target.value })}
        />
      </div>

      <div className="min-w-0">
        <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
          Date To
        </label>
        <Input
          type="date"
          aria-label="Date to"
          className={`${FILTER_H} ${FILTER_RADIUS} w-full text-sm`}
          value={isCustomDateRange ? filters.to : (dateRange.to ?? "")}
          disabled={!isCustomDateRange}
          onChange={(event) => onChange({ to: event.target.value })}
        />
      </div>

      {showClear && onClear ? (
        <div className="min-w-0">
          <Button
            type="button"
            variant="outline"
            className={`${FILTER_H} ${FILTER_RADIUS} w-full px-3 text-sm`}
            onClick={onClear}
          >
            Clear Filters
          </Button>
        </div>
      ) : null}
    </div>
  );
}
