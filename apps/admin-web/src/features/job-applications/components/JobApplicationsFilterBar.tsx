"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import {
  DEFAULT_JOB_APPLICATION_FILTERS,
  INTERVIEW_STATUS_FILTER_OPTIONS,
  JOB_APPLICATION_FILTER_ALL,
} from "@/src/features/job-applications/constants/job-application-filters.constants";
import type { JobApplicationFilters } from "@/src/features/job-applications/hooks/useJobApplications";
import { jobService } from "@/src/features/jobs/services/job.service";
import { isJobExpired } from "@/src/features/jobs/types/job.types";

interface JobApplicationsFilterBarProps {
  filters: JobApplicationFilters;
  isLoading?: boolean;
  disabled?: boolean;
  onFiltersChange: (filters: JobApplicationFilters) => void;
}

export function JobApplicationsFilterBar({
  filters,
  isLoading = false,
  disabled = false,
  onFiltersChange,
}: JobApplicationsFilterBarProps) {
  const [jobOptions, setJobOptions] = useState<
    Array<{ label: string; value: string }>
  >([{ label: "All Jobs", value: JOB_APPLICATION_FILTER_ALL }]);

  useEffect(() => {
    let cancelled = false;

    const loadJobs = async () => {
      try {
        const response = await jobService.getJobs({
          take: 200,
          catalogOnly: true,
        });

        if (cancelled) {
          return;
        }

        const activeJobs = response.items.filter((job) => !isJobExpired(job));

        setJobOptions([
          { label: "All Jobs", value: JOB_APPLICATION_FILTER_ALL },
          ...activeJobs.map((job) => ({
            label: job.jobNumber
              ? `${job.title} (${job.jobNumber})`
              : job.title,
            value: job.id,
          })),
        ]);
      } catch {
        if (!cancelled) {
          setJobOptions([{ label: "All Jobs", value: JOB_APPLICATION_FILTER_ALL }]);
        }
      }
    };

    void loadJobs();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        (filters.search ?? "").trim() ||
          filters.jobId ||
          filters.interviewStatus ||
          filters.appliedFrom ||
          filters.appliedTo,
      ),
    [filters],
  );

  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-full rounded-lg sm:w-[220px]" />
        <Skeleton className="h-9 w-full rounded-lg sm:w-[180px]" />
        <Skeleton className="h-9 w-full rounded-lg sm:w-[170px]" />
        <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
        <Skeleton className="h-9 w-full rounded-lg sm:w-[140px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-full min-w-[220px] flex-1 sm:max-w-[280px]">
        <SearchInput
          value={filters.search}
          placeholder="Search applications..."
          className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
          disabled={disabled}
          onChange={(search) =>
            onFiltersChange({
              ...filters,
              search,
              page: 1,
            })
          }
        />
      </div>

      <div className="w-full sm:w-[180px]">
        <AppSelect
          value={filters.jobId ?? JOB_APPLICATION_FILTER_ALL}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          disabled={disabled}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              jobId: value === JOB_APPLICATION_FILTER_ALL ? undefined : value,
              page: 1,
            })
          }
          options={jobOptions}
        />
      </div>

      <div className="w-full sm:w-[170px]">
        <AppSelect
          value={filters.interviewStatus ?? JOB_APPLICATION_FILTER_ALL}
          triggerClassName="h-9 rounded-lg px-2.5 text-sm"
          disabled={disabled}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              interviewStatus:
                value === JOB_APPLICATION_FILTER_ALL
                  ? undefined
                  : (value as JobApplicationFilters["interviewStatus"]),
              page: 1,
            })
          }
          options={INTERVIEW_STATUS_FILTER_OPTIONS.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <input
          type="date"
          value={filters.appliedFrom ?? ""}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              appliedFrom: event.target.value,
              page: 1,
            })
          }
          className="h-9 w-full rounded-lg border border-[#DCE8F5] bg-white px-2.5 text-sm text-[#102A56]"
          aria-label="Applied from date"
        />
      </div>

      <div className="w-full sm:w-[140px]">
        <input
          type="date"
          value={filters.appliedTo ?? ""}
          disabled={disabled}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              appliedTo: event.target.value,
              page: 1,
            })
          }
          className="h-9 w-full rounded-lg border border-[#DCE8F5] bg-white px-2.5 text-sm text-[#102A56]"
          aria-label="Applied to date"
        />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={disabled || !hasActiveFilters}
        className="h-9 rounded-lg px-3 text-sm"
        onClick={() =>
          onFiltersChange({
            ...DEFAULT_JOB_APPLICATION_FILTERS,
            status: filters.status,
            pageSize: filters.pageSize,
          })
        }
      >
        Clear
      </Button>
    </div>
  );
}
