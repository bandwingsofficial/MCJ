"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  JobApplicationItem,
  JobApplicationJobOption,
} from "@/src/features/branch-ops/types";
import { BranchJobApplicationsFilterBar } from "@/src/features/job-applications/components/BranchJobApplicationsFilterBar";
import { BranchJobApplicationTabs } from "@/src/features/job-applications/components/BranchJobApplicationTabs";
import { BranchJobApplicationsTable } from "@/src/features/job-applications/components/BranchJobApplicationsTable";
import { BranchInterviewWorkspaceModal } from "@/src/features/interviews/components/BranchInterviewWorkspaceModal";
import { BranchScheduleInterviewModal } from "@/src/features/job-applications/components/BranchScheduleInterviewModal";
import { BranchViewApplicationModal } from "@/src/features/job-applications/components/BranchViewApplicationModal";
import {
  pickBranchConductInterview,
  toInterviewItemFromJobApplication,
} from "@/src/features/job-applications/utils/job-application-display.utils";
import type { InterviewItem } from "@/src/features/branch-ops/types";
import {
  BRANCH_JOB_APPLICATION_PAGE_SIZES,
  DEFAULT_BRANCH_JOB_APPLICATION_FILTERS,
  DEFAULT_JOB_APPLICATION_SCHEDULE_COUNTS,
  type BranchJobApplicationFilters,
  type JobApplicationScheduleTab,
} from "@/src/features/job-applications/constants/job-application.constants";
import { useCurrentBranchId } from "@/src/features/auth/hooks/use-current-branch";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { CategoryPagination } from "@/src/shared/components/ui/category-pagination";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

export default function JobApplicationsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const branchId = useCurrentBranchId();
  const [filters, setFilters] = useState<BranchJobApplicationFilters>(
    DEFAULT_BRANCH_JOB_APPLICATION_FILTERS,
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [jobOptions, setJobOptions] = useState<JobApplicationJobOption[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplicationItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [interviewViewOpen, setInterviewViewOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewItem | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setFilters((current) => ({ ...current, page: 1 }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const scheduleTabParam =
    filters.scheduleTab === "ALL" ? undefined : filters.scheduleTab;

  const query = useAsyncData(
    () =>
      branchOpsApi.jobApplications({
        search: debouncedSearch || undefined,
        jobId: filters.jobId === "ALL" ? undefined : filters.jobId,
        interviewPhase: scheduleTabParam,
        roundId: filters.roundId === "ALL" ? undefined : filters.roundId,
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    [
      branchId,
      debouncedSearch,
      filters.jobId,
      filters.scheduleTab,
      filters.roundId,
      filters.page,
      filters.pageSize,
    ],
  );

  useEffect(() => {
    if (query.data?.jobOptions?.length) {
      setJobOptions(query.data.jobOptions);
    }
  }, [query.data?.jobOptions]);

  useEffect(() => {
    if (!selectedApplication || !query.data?.items) {
      return;
    }

    const refreshed = query.data.items.find(
      (item) => item.id === selectedApplication.id,
    );
    if (refreshed) {
      setSelectedApplication(refreshed);
      return;
    }

    setSelectedApplication(null);
    setViewOpen(false);
    setInterviewViewOpen(false);
    setScheduleOpen(false);
    setSelectedInterview(null);
  }, [query.data?.items, selectedApplication?.id]);

  useEffect(() => {
    const refetchOnFocus = () => {
      void query.reload({ silent: true });
    };
    window.addEventListener("focus", refetchOnFocus);
    return () => window.removeEventListener("focus", refetchOnFocus);
  }, [query.reload]);

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const scheduleCounts =
    query.data?.scheduleCounts ?? DEFAULT_JOB_APPLICATION_SCHEDULE_COUNTS;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const from = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const to = Math.min(filters.page * filters.pageSize, total);
  const isInitialLoading = query.loading && !query.data;

  const handleFiltersChange = (next: BranchJobApplicationFilters) => {
    setSearchInput(next.search);
    setFilters(next);
    if (next.search.trim() !== debouncedSearch) {
      setDebouncedSearch(next.search.trim());
    }
  };

  const openView = (application: JobApplicationItem) => {
    setSelectedApplication(application);
    setScheduleOpen(false);
    const conductRow = pickBranchConductInterview(application);
    if (conductRow) {
      setViewOpen(false);
      setSelectedInterview(
        toInterviewItemFromJobApplication(application, conductRow),
      );
      setInterviewViewOpen(true);
      return;
    }
    setInterviewViewOpen(false);
    setSelectedInterview(null);
    setViewOpen(true);
  };

  const openSchedule = (application: JobApplicationItem) => {
    setSelectedApplication(application);
    setViewOpen(false);
    setInterviewViewOpen(false);
    setSelectedInterview(null);
    setScheduleOpen(true);
  };

  return (
    <div className="space-y-3">
      <header className="px-1 py-1">
        <nav
          aria-label="Breadcrumb"
          className="mb-1 flex items-center gap-1 text-xs"
        >
          <Link
            href="/dashboard"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            {formatRoleLabel(role) || "Branch"}
          </Link>
          <ChevronRight
            className="h-3.5 w-3.5 text-slate-400"
            aria-hidden="true"
          />
          <span aria-current="page" className="font-medium text-[#102A56]">
            Job Applications
          </span>
        </nav>

        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
              Job Applications
            </h1>
            <span className="text-xs text-[#647A9B] sm:text-[13px]">
              Assigned Applications:
              <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                {isInitialLoading ? "—" : total}
              </span>
            </span>
          </div>
        </div>
      </header>

      <BranchJobApplicationTabs
        counts={scheduleCounts}
        activeTab={filters.scheduleTab}
        disabled={query.loading}
        onChange={(scheduleTab: JobApplicationScheduleTab) =>
          setFilters((current) => ({ ...current, scheduleTab, page: 1 }))
        }
      />

      <BranchJobApplicationsFilterBar
        filters={{ ...filters, search: searchInput }}
        jobOptions={jobOptions}
        disabled={query.loading}
        onChange={handleFiltersChange}
      />

      {isInitialLoading ? (
        <div className="min-w-0 overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <SkeletonTable rows={8} />
        </div>
      ) : query.error && !query.data ? (
        <ErrorState description={query.error} onRetry={query.reload} />
      ) : (
        <div className="min-w-0 overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          {query.error ? (
            <div className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {query.error}{" "}
              <button
                type="button"
                className="font-medium underline"
                onClick={() => {
                  void query.reload();
                }}
              >
                Retry
              </button>
            </div>
          ) : null}

          <div aria-busy={query.loading} className="relative">
            {query.loading ? (
              <span className="sr-only">Updating applications</span>
            ) : null}
            <BranchJobApplicationsTable
              applications={items}
              actionsDisabled={query.loading}
              onView={openView}
              onSchedule={openSchedule}
            />
          </div>

          <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <label className="flex items-center gap-1.5">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                  value={filters.pageSize}
                  disabled={query.loading}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      pageSize: Number(event.target.value),
                      page: 1,
                    }))
                  }
                >
                  {BRANCH_JOB_APPLICATION_PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <CategoryPagination
              page={filters.page}
              totalPages={totalPages}
              onPageChange={(nextPage) =>
                setFilters((current) => ({ ...current, page: nextPage }))
              }
            />
          </div>
        </div>
      )}

      <BranchViewApplicationModal
        open={viewOpen}
        application={selectedApplication}
        onClose={() => {
          setViewOpen(false);
          setSelectedApplication(null);
        }}
      />

      <BranchScheduleInterviewModal
        open={scheduleOpen}
        application={selectedApplication}
        onClose={() => {
          setScheduleOpen(false);
          setSelectedApplication(null);
        }}
        onSuccess={async () => {
          await query.reload();
        }}
      />

      <BranchInterviewWorkspaceModal
        open={interviewViewOpen}
        interview={selectedInterview}
        onClose={() => {
          setInterviewViewOpen(false);
          setSelectedInterview(null);
          setSelectedApplication(null);
        }}
      />
    </div>
  );
}
