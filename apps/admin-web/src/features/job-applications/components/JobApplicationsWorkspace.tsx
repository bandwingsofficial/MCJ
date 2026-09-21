"use client";

import { useMemo, useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";

import { ApplicationStatusTabs } from "@/src/features/job-applications/components/ApplicationStatusTabs";
import { JobApplicationDetailsDialog } from "@/src/features/job-applications/components/JobApplicationDetailsDialog";
import { JobApplicationsFilterBar } from "@/src/features/job-applications/components/JobApplicationsFilterBar";
import { JobApplicationTable } from "@/src/features/job-applications/components/JobApplicationTable";
import { AssignInterviewDialog } from "@/src/features/job-applications/components/AssignInterviewDialog";
import { RejectJobApplicationDialog } from "@/src/features/job-applications/components/RejectJobApplicationDialog";
import type {
  ApplicationStatusCounts,
  ApplicationStatusFilter,
  JobApplicationFilters,
} from "@/src/features/job-applications/hooks/useJobApplications";
import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type {
  JobApplication,
} from "@/src/features/job-applications/types/job-application.types";
import { getEmptyApplicationsMessage } from "@/src/features/job-applications/utils/job-application-display.utils";

interface JobApplicationsWorkspaceProps {
  applications: JobApplication[];
  total: number;
  statusCounts: ApplicationStatusCounts;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filters: JobApplicationFilters;
  setFilters: (filters: JobApplicationFilters) => void;
  refetch: (overrideFilters?: JobApplicationFilters) => Promise<void>;
  actionsDisabled?: boolean;
}

export function JobApplicationsWorkspace({
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
}: JobApplicationsWorkspaceProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"approve" | "unassign" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [isActing, setIsActing] = useState(false);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const emptyState = getEmptyApplicationsMessage(filters.status);

  const confirmCopy = useMemo(() => {
    if (confirmAction === "unassign") {
      return {
        title: "Unassign Interviewer?",
        description:
          "This removes the Branch and Interviewer assignment only. The application stays shortlisted and can be assigned again.",
        confirmLabel: "Unassign",
        loadingLabel: "Unassigning...",
        confirmVariant: "danger" as const,
      };
    }

    return {
      title: "Shortlist Application?",
      description:
        "Are you sure you want to shortlist this candidate application?",
      confirmLabel: "Shortlist",
      loadingLabel: "Shortlisting...",
      confirmVariant: "success" as const,
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
    setRejectOpen(true);
  };

  const requestAssignInterview = (application: JobApplication) => {
    setSelectedApplication(application);
    setAssignOpen(true);
  };

  const requestUnassignInterview = (application: JobApplication) => {
    setSelectedApplication(application);
    setAssignOpen(false);
    setConfirmAction("unassign");
  };

  const runApprove = async () => {
    if (!selectedApplication) {
      return;
    }

    try {
      setIsActing(true);
      await jobApplicationService.updateStatus(selectedApplication.id, {
        status: "SHORTLISTED",
      });
      appToast.success("Application shortlisted.");
      setConfirmAction(null);
      setDetailsOpen(false);
      setSelectedApplication(null);

      const nextFilters: JobApplicationFilters = {
        ...filters,
        status: "ACCEPTED" as ApplicationStatusFilter,
        page: 1,
      };
      setFilters(nextFilters);
      await refetch(nextFilters);
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

  const runUnassign = async () => {
    if (!selectedApplication) {
      return;
    }

    try {
      setIsActing(true);
      await jobApplicationService.unassignInterview(selectedApplication.id);
      appToast.success("Interviewer unassigned.");
      setConfirmAction(null);
      setAssignOpen(false);
      setDetailsOpen(false);
      setSelectedApplication(null);
      await refetch();
    } catch (err) {
      appToast.error(
        err instanceof Error
          ? err.message
          : "Unable to unassign interviewer. Please try again.",
      );
    } finally {
      setIsActing(false);
    }
  };

  const runReject = async (rejectionReason: string) => {
    if (!selectedApplication) {
      return;
    }

    try {
      setIsActing(true);
      await jobApplicationService.updateStatus(selectedApplication.id, {
        status: "REJECTED",
        rejectionReason,
      });
      appToast.success("Application rejected.");
      setRejectOpen(false);
      setDetailsOpen(false);
      setSelectedApplication(null);

      setFilters({
        ...filters,
        status: "REJECTED" as ApplicationStatusFilter,
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
      <div className="space-y-3">
        <JobApplicationsFilterBar
          filters={filters}
          isLoading={isInitialLoading}
          disabled={isActing || isFetching || actionsDisabled}
          onFiltersChange={setFilters}
        />

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

        <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
          {isInitialLoading ? (
            <SkeletonTable rows={8} />
          ) : (
            <>
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
                  <span className="sr-only">Updating applications</span>
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
                  onAssignInterview={requestAssignInterview}
                  onUnassignInterview={requestUnassignInterview}
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
        onAssignInterview={requestAssignInterview}
        onUnassignInterview={requestUnassignInterview}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmCopy.title}
        description={confirmCopy.description}
        confirmLabel={confirmCopy.confirmLabel}
        loading={isActing}
        loadingLabel={confirmCopy.loadingLabel}
        confirmVariant={confirmCopy.confirmVariant}
        onConfirm={() => {
          if (confirmAction === "unassign") {
            void runUnassign();
            return;
          }
          void runApprove();
        }}
        onCancel={() => {
          if (isActing) {
            return;
          }
          setConfirmAction(null);
        }}
      />

      <RejectJobApplicationDialog
        open={rejectOpen}
        loading={isActing}
        onConfirm={(reason) => {
          void runReject(reason);
        }}
        onClose={() => {
          if (isActing) {
            return;
          }
          setRejectOpen(false);
        }}
      />

      <AssignInterviewDialog
        open={assignOpen}
        application={selectedApplication}
        onClose={() => {
          if (isActing) {
            return;
          }
          setAssignOpen(false);
        }}
        onUnassign={requestUnassignInterview}
        onSuccess={async () => {
          setAssignOpen(false);
          setDetailsOpen(false);
          setSelectedApplication(null);
          await refetch();
        }}
      />
    </>
  );
}
