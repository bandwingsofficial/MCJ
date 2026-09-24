"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { InterviewItem, InterviewRoundOption } from "@/src/features/branch-ops/types";
import { BranchCompleteInterviewModal } from "@/src/features/interviews/components/BranchCompleteInterviewModal";
import { BranchInterviewRoundTabs } from "@/src/features/interviews/components/BranchInterviewRoundTabs";
import { BranchInterviewsFilterBar } from "@/src/features/interviews/components/BranchInterviewsFilterBar";
import { BranchInterviewsTable } from "@/src/features/interviews/components/BranchInterviewsTable";
import { BranchViewInterviewModal } from "@/src/features/interviews/components/BranchViewInterviewModal";
import {
  BRANCH_INTERVIEW_PAGE_SIZES,
  DEFAULT_BRANCH_INTERVIEW_FILTERS,
  type BranchInterviewFilters,
  type InterviewRoundTab,
} from "@/src/features/interviews/constants/interview.constants";
import { useCurrentBranchId } from "@/src/features/auth/hooks/use-current-branch";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { CategoryPagination } from "@/src/shared/components/ui/category-pagination";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

export default function InterviewsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const branchId = useCurrentBranchId();
  const [filters, setFilters] = useState<BranchInterviewFilters>(
    DEFAULT_BRANCH_INTERVIEW_FILTERS,
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [interviewerOptions, setInterviewerOptions] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [roundOptions, setRoundOptions] = useState<InterviewRoundOption[]>([]);
  const [selectedInterview, setSelectedInterview] =
    useState<InterviewItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setFilters((current) => ({ ...current, page: 1 }));
    }, 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const listRoundId =
    filters.roundTab === "ALL" ? undefined : filters.roundTab;

  const query = useAsyncData(
    () =>
      branchOpsApi.interviews({
        search: debouncedSearch || undefined,
        interviewerId:
          filters.interviewerId === "ALL" ? undefined : filters.interviewerId,
        mode: filters.mode === "ALL" ? undefined : filters.mode,
        roundId: listRoundId,
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
    [
      branchId,
      debouncedSearch,
      filters.roundTab,
      filters.interviewerId,
      filters.mode,
      filters.page,
      filters.pageSize,
    ],
  );

  useEffect(() => {
    if (query.data?.interviewerOptions?.length) {
      setInterviewerOptions(query.data.interviewerOptions);
    }
  }, [query.data?.interviewerOptions]);

  useEffect(() => {
    if (query.data?.roundOptions?.length) {
      setRoundOptions(query.data.roundOptions);
    }
  }, [query.data?.roundOptions]);

  const items = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalCount = query.data?.counts?.total ?? 0;
  const roundCounts = query.data?.roundCounts ?? [];
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const from = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const to = Math.min(filters.page * filters.pageSize, total);
  const isInitialLoading = query.loading && !query.data;

  const handleFiltersChange = (next: BranchInterviewFilters) => {
    setSearchInput(next.search);
    setFilters(next);
    if (next.search.trim() !== debouncedSearch) {
      setDebouncedSearch(next.search.trim());
    }
  };

  const handleRoundTabChange = (roundTab: InterviewRoundTab) => {
    setFilters((current) => ({ ...current, roundTab, page: 1 }));
  };

  const clearSelection = () => {
    setSelectedInterview(null);
  };

  const openView = (interview: InterviewItem) => {
    setSelectedInterview(interview);
    setCompleteOpen(false);
    setViewOpen(true);
  };

  const openRecordResult = (interview: InterviewItem) => {
    setSelectedInterview(interview);
    setViewOpen(false);
    setCompleteOpen(true);
  };

  const handleCompleteSuccess = async () => {
    await query.reload();
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
            Interviews
          </span>
        </nav>

        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:gap-4">
          <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
              Interviews
            </h1>
            <span className="text-xs text-[#647A9B] sm:text-[13px]">
              Scheduled Interviews:
              <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                {isInitialLoading ? "—" : totalCount}
              </span>
            </span>
          </div>
        </div>
      </header>

      <BranchInterviewRoundTabs
        rounds={roundOptions}
        roundCounts={roundCounts}
        totalCount={totalCount}
        activeRoundId={filters.roundTab}
        disabled={query.loading}
        onChange={handleRoundTabChange}
      />

      <BranchInterviewsFilterBar
        filters={{ ...filters, search: searchInput }}
        interviewerOptions={interviewerOptions}
        roundOptions={roundOptions}
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
              <span className="sr-only">Updating interviews</span>
            ) : null}
            <BranchInterviewsTable
              interviews={items}
              actionsDisabled={query.loading}
              onView={openView}
              onRecordResult={openRecordResult}
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
                  {BRANCH_INTERVIEW_PAGE_SIZES.map((size) => (
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

      <BranchViewInterviewModal
        open={viewOpen}
        interview={selectedInterview}
        onClose={() => {
          setViewOpen(false);
          clearSelection();
        }}
      />

      <BranchCompleteInterviewModal
        open={completeOpen}
        interview={selectedInterview}
        onClose={() => {
          setCompleteOpen(false);
          clearSelection();
        }}
        onSuccess={handleCompleteSuccess}
      />
    </div>
  );
}
