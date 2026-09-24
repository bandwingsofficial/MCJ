"use client";

import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  InterviewRoundItem,
  JobApplicationJobOption,
} from "@/src/features/branch-ops/types";
import {
  DEFAULT_BRANCH_JOB_APPLICATION_FILTERS,
  type BranchJobApplicationFilters,
} from "@/src/features/job-applications/constants/job-application.constants";
import { formatInterviewRoundOrderLabel } from "@/src/features/interviews/utils/interview-round-accent.utils";
import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
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
  const [roundOptions, setRoundOptions] = useState<InterviewRoundItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void branchOpsApi
      .activeInterviewRounds()
      .then((rounds) => {
        if (!cancelled) {
          setRoundOptions(rounds);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRoundOptions([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasActiveFilters =
    Boolean(filters.search.trim()) ||
    filters.jobId !== "ALL" ||
    filters.roundId !== "ALL";

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

      <div className="w-full sm:w-[200px]">
        <AppSelect
          value={filters.roundId}
          disabled={disabled}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          placeholder="Interview Rounds"
          onValueChange={(value) =>
            onChange({ ...filters, roundId: value, page: 1 })
          }
          options={[
            { label: "Interview Rounds", value: "ALL" },
            ...[...roundOptions]
              .sort(
                (a, b) =>
                  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
              )
              .map((round) => ({
                label: formatInterviewRoundOrderLabel({
                  sortOrder: round.sortOrder,
                  name: round.name,
                }),
                value: round.id,
              })),
          ]}
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
            scheduleTab: filters.scheduleTab,
            pageSize: filters.pageSize,
          })
        }
      >
        Clear
      </Button>
    </div>
  );
}
