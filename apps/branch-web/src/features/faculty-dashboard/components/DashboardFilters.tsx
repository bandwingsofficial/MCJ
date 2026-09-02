"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";

import { DASHBOARD_CARD, FILTER_TRIGGER } from "../constants";
import type {
  DashboardDatePreset,
  DashboardFilterState,
} from "../types/facultyDashboard.types";

const DATE_OPTIONS: Array<{ label: string; value: DashboardDatePreset }> = [
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Last 7 Days", value: "LAST_7_DAYS" },
  { label: "Last 30 Days", value: "LAST_30_DAYS" },
  { label: "Custom", value: "CUSTOM" },
];

interface Props {
  filters: DashboardFilterState;
  batchOptions: Array<{ label: string; value: string }>;
  sessionOptions: Array<{ label: string; value: string }>;
  assessmentTypeOptions: Array<{ label: string; value: string }>;
  onChange: (patch: Partial<DashboardFilterState>) => void;
  onClear: () => void;
}

export function DashboardFilters({
  filters,
  batchOptions,
  sessionOptions,
  assessmentTypeOptions,
  onChange,
  onClear,
}: Props) {
  const isCustom = filters.datePreset === "CUSTOM";

  return (
    <div className={`${DASHBOARD_CARD} px-4 py-3`}>
      <div className="flex flex-wrap items-center gap-2">
        <AppSelect
          value={filters.datePreset}
          options={DATE_OPTIONS.map((item) => ({
            label: item.label,
            value: item.value,
          }))}
          triggerClassName={`w-[128px] shrink-0 ${FILTER_TRIGGER}`}
          onValueChange={(value) =>
            onChange({ datePreset: value as DashboardDatePreset })
          }
        />
        <AppSelect
          value={filters.batchId}
          options={batchOptions}
          triggerClassName={`min-w-[130px] max-w-[170px] flex-1 sm:flex-none ${FILTER_TRIGGER}`}
          onValueChange={(value) => onChange({ batchId: value })}
        />
        <AppSelect
          value={filters.batchCourseId}
          options={sessionOptions}
          disabled={filters.batchId === "ALL"}
          triggerClassName={`min-w-[130px] max-w-[170px] flex-1 sm:flex-none ${FILTER_TRIGGER}`}
          onValueChange={(value) => onChange({ batchCourseId: value })}
        />
        <AppSelect
          value={filters.assessmentType}
          options={assessmentTypeOptions}
          triggerClassName={`min-w-[110px] max-w-[140px] flex-1 sm:flex-none ${FILTER_TRIGGER}`}
          onValueChange={(value) => onChange({ assessmentType: value })}
        />
        <Button
          type="button"
          variant="outline"
          className="h-9 shrink-0 rounded-lg border-[#DCE8F5] px-3 text-sm text-[#647A9B] hover:text-[#102A56]"
          onClick={onClear}
        >
          Clear
        </Button>
      </div>

      {isCustom ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <Input
            type="date"
            aria-label="From date"
            className={`h-9 w-[140px] rounded-lg text-sm ${FILTER_TRIGGER}`}
            value={filters.customFrom}
            onChange={(event) =>
              onChange({ customFrom: event.target.value })
            }
          />
          <Input
            type="date"
            aria-label="To date"
            className={`h-9 w-[140px] rounded-lg text-sm ${FILTER_TRIGGER}`}
            value={filters.customTo}
            onChange={(event) => onChange({ customTo: event.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}
