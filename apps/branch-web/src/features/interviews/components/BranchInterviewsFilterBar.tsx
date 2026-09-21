"use client";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  BRANCH_INTERVIEW_MODE_OPTIONS,
  BRANCH_INTERVIEW_ROUND_OPTIONS,
  BRANCH_INTERVIEW_STATUS_OPTIONS,
  DEFAULT_BRANCH_INTERVIEW_FILTERS,
  type BranchInterviewFilters,
} from "@/src/features/interviews/constants/interview.constants";

interface InterviewerOption {
  id: string;
  name: string;
  email: string;
}

interface Props {
  filters: BranchInterviewFilters;
  interviewerOptions: InterviewerOption[];
  disabled?: boolean;
  onChange: (filters: BranchInterviewFilters) => void;
}

export function BranchInterviewsFilterBar({
  filters,
  interviewerOptions,
  disabled = false,
  onChange,
}: Props) {
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.interviewerId !== "ALL" ||
    filters.mode !== "ALL" ||
    filters.roundNumber !== "ALL" ||
    filters.status !== "ALL" ||
    Boolean(filters.from) ||
    Boolean(filters.to);

  const dateInputClass =
    "h-9 w-full rounded-lg border border-[#DCE8F5] bg-white px-2.5 text-sm text-[#102A56]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full min-w-[220px] flex-1 sm:max-w-[280px]">
        <SearchInput
          value={filters.search}
          placeholder="Search candidate or job..."
          className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
          onChange={(value) =>
            onChange({ ...filters, search: value, page: 1 })
          }
        />
      </div>

      <div className="w-full sm:w-[180px]">
        <AppSelect
          value={filters.interviewerId}
          disabled={disabled}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          onValueChange={(value) =>
            onChange({ ...filters, interviewerId: value, page: 1 })
          }
          options={[
            { label: "All Interviewers", value: "ALL" },
            ...interviewerOptions.map((person) => ({
              label: person.name || person.email,
              value: person.id,
            })),
          ]}
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <AppSelect
          value={filters.mode}
          disabled={disabled}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          onValueChange={(value) =>
            onChange({ ...filters, mode: value, page: 1 })
          }
          options={[...BRANCH_INTERVIEW_MODE_OPTIONS]}
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <AppSelect
          value={filters.roundNumber}
          disabled={disabled}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          onValueChange={(value) =>
            onChange({ ...filters, roundNumber: value, page: 1 })
          }
          options={[...BRANCH_INTERVIEW_ROUND_OPTIONS]}
        />
      </div>

      <div className="w-full sm:w-[150px]">
        <AppSelect
          value={filters.status}
          disabled={disabled}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          onValueChange={(value) =>
            onChange({ ...filters, status: value, page: 1 })
          }
          options={[...BRANCH_INTERVIEW_STATUS_OPTIONS]}
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <input
          type="date"
          className={dateInputClass}
          value={filters.from}
          disabled={disabled}
          aria-label="Date from"
          onChange={(event) =>
            onChange({ ...filters, from: event.target.value, page: 1 })
          }
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <input
          type="date"
          className={dateInputClass}
          value={filters.to}
          disabled={disabled}
          aria-label="Date to"
          onChange={(event) =>
            onChange({ ...filters, to: event.target.value, page: 1 })
          }
        />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={disabled || !hasActiveFilters}
        className="h-9 rounded-lg px-3 text-sm"
        onClick={() =>
          onChange({
            ...DEFAULT_BRANCH_INTERVIEW_FILTERS,
            tab: filters.tab,
            pageSize: filters.pageSize,
          })
        }
      >
        Clear
      </Button>
    </div>
  );
}
