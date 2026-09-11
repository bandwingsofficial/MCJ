"use client";

import { Card } from "@/src/shared/components/ui/card";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import {
  JobBulkActionsToolbar,
  type BulkJobAction,
} from "@/src/features/jobs/components/job-bulk-actions-toolbar";
import { JobTable } from "@/src/features/jobs/components/JobTable";
import { DEFAULT_JOB_PAGE_SIZE } from "@/src/features/jobs/constants/job.constants";
import type { Job, JobFilters } from "@/src/features/jobs/types/job.types";

interface JobsCatalogPanelProps {
  jobs: Job[];
  total: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  refetch: () => Promise<void>;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  actionLoading: boolean;
  onBulkAction: (action: BulkJobAction) => void;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onActivate: (job: Job) => void;
  onDeactivate: (job: Job) => void;
  onArchive: (job: Job) => void;
  onRestore: (job: Job) => void;
}

export function JobsCatalogPanel({
  jobs,
  total,
  isInitialLoading,
  isFetching,
  error,
  filters,
  setFilters,
  refetch,
  selectedIds,
  onSelectionChange,
  actionLoading,
  onBulkAction,
  onView,
  onEdit,
  onActivate,
  onDeactivate,
  onArchive,
  onRestore,
}: JobsCatalogPanelProps) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_JOB_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
      {isInitialLoading ? (
        <SkeletonTable rows={8} />
      ) : (
        <>
          <JobBulkActionsToolbar
            jobs={jobs}
            selectedJobIds={selectedIds}
            disabled={actionLoading || isFetching}
            onAction={onBulkAction}
          />

          {error ? (
            <div className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}{" "}
              <button
                type="button"
                className="font-medium underline"
                onClick={() => {
                  void refetch();
                }}
              >
                Retry
              </button>
            </div>
          ) : null}

          <div aria-busy={isFetching} className="relative">
            {isFetching ? (
              <span className="sr-only">Updating jobs</span>
            ) : null}
            <JobTable
              jobs={jobs}
              selectedJobIds={selectedIds}
              onSelectionChange={onSelectionChange}
              actionsDisabled={actionLoading || isFetching}
              selectionDisabled={actionLoading || isFetching}
              onView={onView}
              onEdit={onEdit}
              onActivate={onActivate}
              onDeactivate={onDeactivate}
              onArchive={onArchive}
              onRestore={onRestore}
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
                  value={pageSize}
                  disabled={actionLoading}
                  onChange={(event) =>
                    setFilters({
                      ...filters,
                      pageSize: Number(event.target.value),
                    })
                  }
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <CategoryPagination
              page={page}
              totalPages={totalPages}
              onPageChange={(nextPage) =>
                setFilters({ ...filters, page: nextPage })
              }
            />
          </div>
        </>
      )}
    </Card>
  );
}
