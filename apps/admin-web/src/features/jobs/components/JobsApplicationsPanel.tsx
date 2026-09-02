"use client";

import { useMemo, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";

import { ApplicationStatusTabs } from "@/src/features/job-applications/components/ApplicationStatusTabs";
import { JobApplicationDetailsDialog } from "@/src/features/job-applications/components/JobApplicationDetailsDialog";
import { JobApplicationTable } from "@/src/features/job-applications/components/JobApplicationTable";
import type {
  ApplicationStatusCounts,
  JobApplicationFilters,
} from "@/src/features/job-applications/hooks/useJobApplications";
import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type {
  JobApplication,
  OnboardingStatusFilter,
} from "@/src/features/job-applications/types/job-application.types";
import { getEmptyApplicationsMessage } from "@/src/features/job-applications/utils/job-application-display.utils";

interface JobsApplicationsPanelProps {
  applications: JobApplication[];
  total: number;
  statusCounts: ApplicationStatusCounts;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filters: JobApplicationFilters;
  setFilters: (filters: JobApplicationFilters) => void;
  refetch: () => Promise<void>;
  actionsDisabled?: boolean;
}

export function JobsApplicationsPanel({
  applications,
  total,
  statusCounts,
  isInitialLoading,
  isFetching,
  error,
  filters,
  setFilters,
  refetch,
  actionsDisabled = false,
}: JobsApplicationsPanelProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [isActing, setIsActing] = useState(false);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const emptyState = getEmptyApplicationsMessage(filters.status);

  const confirmCopy = useMemo(() => {
    if (confirmAction === "approve") {
      return {
        title: "Approve Application?",
        description:
          "Are you sure you want to approve this candidate application?",
        confirmLabel: "Approve",
      };
    }

    return {
      title: "Reject Application?",
      description:
        "Are you sure you want to reject this candidate application?",
      confirmLabel: "Reject",
    };
  }, [confirmAction]);

  const openReview = (application: JobApplication) => {
    setSelectedApplication(application);
    setDetailsOpen(true);
  };

  const requestApprove = (application: JobApplication) => {
    setSelectedApplication(application);
    setConfirmAction("approve");
  };

  const requestReject = (application: JobApplication) => {
    setSelectedApplication(application);
    setConfirmAction("reject");
  };

  const runStatusChange = async () => {
    if (!selectedApplication || !confirmAction) {
      return;
    }

    try {
      setIsActing(true);
      await jobApplicationService.updateStatus(selectedApplication.id, {
        status: confirmAction === "approve" ? "SELECTED" : "REJECTED",
      });
      appToast.success(
        confirmAction === "approve"
          ? "Application approved."
          : "Application rejected.",
      );
      setConfirmAction(null);
      setDetailsOpen(false);
      setSelectedApplication(null);

      setFilters({
        ...filters,
        status:
          confirmAction === "approve"
            ? ("ACCEPTED" as OnboardingStatusFilter)
            : ("REJECTED" as OnboardingStatusFilter),
        page: 1,
      });

      await refetch();
    } catch (err) {
      appToast.error(
        err instanceof Error
          ? err.message
          : "Unable to update application. Please try again.",
      );
    } finally {
      setIsActing(false);
    }
  };

  return (
    <>
      <div className="mt-5 space-y-3">
        <ApplicationStatusTabs
          activeStatus={filters.status}
          counts={statusCounts}
          disabled={isActing || isFetching || actionsDisabled}
          onChange={(status) =>
            setFilters({
              ...filters,
              status,
              page: 1,
            })
          }
        />

        <Card className="overflow-hidden p-0">
          {isInitialLoading ? (
            <div className="p-4">
              <SkeletonTable rows={8} />
            </div>
          ) : (
            <>
              {error ? (
                <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">
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
                  <div className="pointer-events-none absolute inset-0 z-10 bg-white/40" />
                ) : null}
                <JobApplicationTable
                  applications={applications}
                  selectedIds={selectedIds}
                  onSelectionChange={setSelectedIds}
                  actionsDisabled={actionsDisabled || isActing || isFetching}
                  emptyTitle={emptyState.title}
                  emptyDescription={emptyState.description}
                  onView={openReview}
                  onApprove={requestApprove}
                  onReject={requestReject}
                />
              </div>

              <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-[#DCE8F5] bg-[#F8FBFF] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                {total > 0 ? (
                  <>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-[#647A9B]">
                      <span className="leading-9">
                        Showing {from}–{to} of {total}
                      </span>
                      <label className="flex items-center gap-2 leading-9">
                        <span className="whitespace-nowrap">Rows per page</span>
                        <select
                          className="h-9 rounded-xl border border-[#DCE8F5] bg-white px-2 text-[15px] text-[#102A56]"
                          value={pageSize}
                          disabled={isActing}
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
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={(nextPage) =>
                        setFilters({ ...filters, page: nextPage })
                      }
                    />
                  </>
                ) : (
                  <p className="text-[15px] leading-9 text-slate-500">
                    No applications to paginate
                  </p>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      <JobApplicationDetailsDialog
        open={detailsOpen}
        application={selectedApplication}
        isActing={isActing}
        onClose={() => {
          if (isActing) {
            return;
          }
          setDetailsOpen(false);
        }}
        onApprove={requestApprove}
        onReject={requestReject}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        loading={isActing}
        loadingLabel={
          confirmAction === "approve" ? "Approving..." : "Rejecting..."
        }
        confirmVariant={confirmAction === "approve" ? "success" : "danger"}
        onConfirm={() => {
          void runStatusChange();
        }}
        onCancel={() => {
          if (isActing) {
            return;
          }
          setConfirmAction(null);
        }}
      />
    </>
  );
}
