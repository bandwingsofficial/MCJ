"use client";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import type { JobApplicationJobOption } from "@/src/features/branch-ops/types";
import {
  BRANCH_INTERVIEW_PHASE_OPTIONS,
  BRANCH_JOB_APPLICATION_STATUS_OPTIONS,
  DEFAULT_BRANCH_JOB_APPLICATION_FILTERS,
  type BranchJobApplicationFilters,
  type InterviewPhaseFilter,
} from "@/src/features/job-applications/constants/job-application.constants";

interface Props {
  filters: BranchJobApplicationFilters;
  jobOptions: JobApplicationJobOption[];
  disabled?: boolean;
  onChange: (filters: BranchJobApplicationFilters) => void;
}

export function BranchJobApplicationsFilterBar({
  filters,
  jobOptions,
  disabled = false,
  onChange,
}: Props) {
  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.status !== "ALL" ||
    filters.jobId !== "ALL" ||
    filters.interviewPhase !== "ALL" ||
    Boolean(filters.appliedFrom) ||
    Boolean(filters.appliedTo);

  const dateInputClass =
    "h-9 w-full rounded-lg border border-[#DCE8F5] bg-white px-2.5 text-sm text-[#102A56]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full min-w-[220px] flex-1 sm:max-w-[280px]">
        <SearchInput
          value={filters.search}
          placeholder="Search applications..."
          className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
          onChange={(value) =>
            onChange({ ...filters, search: value, page: 1 })
          }
        />
      </div>

      <div className="w-full sm:w-[180px]">
        <AppSelect
          value={filters.jobId}
          disabled={disabled}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          onValueChange={(value) =>
            onChange({ ...filters, jobId: value, page: 1 })
          }
          options={[
            { label: "All Jobs", value: "ALL" },
            ...jobOptions.map((job) => ({
              label: job.jobNumber
                ? `${job.title} (${job.jobNumber})`
                : job.title,
              value: job.id,
            })),
          ]}
        />
      </div>

      <div className="w-full sm:w-[160px]">
        <AppSelect
          value={filters.status}
          disabled={disabled}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          onValueChange={(value) =>
            onChange({ ...filters, status: value, page: 1 })
          }
          options={[...BRANCH_JOB_APPLICATION_STATUS_OPTIONS]}
        />
      </div>

      <div className="w-full sm:w-[200px]">
        <AppSelect
          value={filters.interviewPhase}
          disabled={disabled}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          onValueChange={(value) =>
            onChange({
              ...filters,
              interviewPhase: value as InterviewPhaseFilter,
              page: 1,
            })
          }
          options={[...BRANCH_INTERVIEW_PHASE_OPTIONS]}
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <input
          type="date"
          className={dateInputClass}
          value={filters.appliedFrom}
          disabled={disabled}
          aria-label="Applied from"
          onChange={(event) =>
            onChange({
              ...filters,
              appliedFrom: event.target.value,
              page: 1,
            })
          }
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <input
          type="date"
          className={dateInputClass}
          value={filters.appliedTo}
          disabled={disabled}
          aria-label="Applied to"
          onChange={(event) =>
            onChange({
              ...filters,
              appliedTo: event.target.value,
              page: 1,
            })
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
            ...DEFAULT_BRANCH_JOB_APPLICATION_FILTERS,
            pageSize: filters.pageSize,
          })
        }
      >
        Clear
      </Button>
    </div>
  );
}
