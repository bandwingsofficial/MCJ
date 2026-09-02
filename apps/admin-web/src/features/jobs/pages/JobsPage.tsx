"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";

import { JobDialog } from "@/src/features/jobs/components/JobDialog";
import {
  JobBulkActionsToolbar,
  type BulkJobAction,
} from "@/src/features/jobs/components/job-bulk-actions-toolbar";
import { JobSummaryHeader } from "@/src/features/jobs/components/job-summary-header";
import type { JobsModuleTab } from "@/src/features/jobs/components/job-summary-header";
import { JobTable } from "@/src/features/jobs/components/JobTable";
import { JobViewDrawer } from "@/src/features/jobs/components/JobViewDrawer";
import { JobsApplicationsPanel } from "@/src/features/jobs/components/JobsApplicationsPanel";
import { JobsOnboardingPanel } from "@/src/features/jobs/components/JobsOnboardingPanel";
import { DEFAULT_JOB_PAGE_SIZE } from "@/src/features/jobs/constants/job.constants";
import { useBulkJobActions } from "@/src/features/jobs/hooks/use-bulk-job-actions";
import { useJobOnboarding, useJobs } from "@/src/features/jobs/hooks/useJobs";
import { jobService } from "@/src/features/jobs/services/job.service";
import type {
  CreateJobRequest,
  Job,
} from "@/src/features/jobs/types/job.types";
import { getCompanyOnboardingUrl, getJobApplicationUrl } from "@/src/features/jobs/utils/job-form.utils";
import {
  formatBulkResultToast,
  getEligibleActivateIds,
  getEligibleArchiveIds,
  getEligibleDeactivateIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/jobs/utils/job-bulk.utils";
import { useJobApplications } from "@/src/features/job-applications/hooks/useJobApplications";

type ConfirmAction = "activate" | "deactivate" | "archive" | "restore";

function resolveTab(value: string | null): JobsModuleTab {
  if (value === "onboarding") {
    return "onboarding";
  }

  if (value === "applications") {
    return "applications";
  }

  return "jobs";
}

export function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));

  const {
    jobs,
    total,
    catalogTotal,
    isInitialLoading,
    isFetching,
    error,
    filters,
    setFilters,
    refetch,
  } = useJobs();

  const onboarding = useJobOnboarding();
  const applications = useJobApplications();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkJobAction | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job>();
  const [viewJob, setViewJob] = useState<Job>();
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job>();
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const [isActing, setIsActing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    bulkActivateJobs,
    bulkDeactivateJobs,
    bulkArchiveJobs,
    bulkRestoreJobs,
    bulkPermanentDeleteJobs,
    isPending: isBulkPending,
  } = useBulkJobActions();

  const bulkActionLoading = isBulkPending;
  const actionLoading = isActing || isSubmitting || bulkActionLoading;

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_JOB_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const headerTotal =
    tab === "jobs"
      ? catalogTotal
      : tab === "onboarding"
        ? onboarding.catalogTotal
        : applications.catalogTotal;
  const headerLoading =
    tab === "jobs"
      ? isInitialLoading
      : tab === "onboarding"
        ? onboarding.isInitialLoading
        : applications.isInitialLoading;
  const headerSearch =
    tab === "jobs"
      ? filters.search
      : tab === "onboarding"
        ? onboarding.filters.search
        : applications.filters.search;

  const confirmCopy = useMemo(() => {
    switch (confirmAction) {
      case "activate":
        return {
          title: "Activate Job",
          description:
            "This job will become visible and open for applications.",
        };
      case "deactivate":
        return {
          title: "Deactivate Job",
          description: "This job will be hidden from public listings.",
        };
      case "archive":
        return {
          title: "Archive Job",
          description: "This job will be archived and can be restored later.",
        };
      case "restore":
        return {
          title: "Restore Job",
          description: "This job will be restored to the active catalog.",
        };
      default:
        return { title: "", description: "" };
    }
  }, [confirmAction]);

  const eligibleBulkIds = useMemo(() => {
    if (!bulkConfirmAction) {
      return [];
    }

    switch (bulkConfirmAction) {
      case "activate":
        return getEligibleActivateIds(jobs, selectedIds);
      case "deactivate":
        return getEligibleDeactivateIds(jobs, selectedIds);
      case "archive":
        return getEligibleArchiveIds(jobs, selectedIds);
      case "restore":
        return getEligibleRestoreIds(jobs, selectedIds);
      case "permanent-delete":
        return getEligiblePermanentDeleteIds(jobs, selectedIds);
      default:
        return [];
    }
  }, [bulkConfirmAction, jobs, selectedIds]);

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;

    switch (bulkConfirmAction) {
      case "activate":
        return {
          title: "Activate selected jobs?",
          description: `Activate ${count} selected job${count === 1 ? "" : "s"}?`,
          confirmLabel: "Activate",
          loadingLabel: "Activating...",
          confirmVariant: "success" as const,
        };
      case "deactivate":
        return {
          title: "Deactivate selected jobs?",
          description: `Deactivate ${count} selected job${count === 1 ? "" : "s"}? They will be hidden from public listings.`,
          confirmLabel: "Deactivate",
          loadingLabel: "Deactivating...",
          confirmVariant: "primary" as const,
        };
      case "archive":
        return {
          title: "Archive selected jobs?",
          description: `Archive ${count} selected job${count === 1 ? "" : "s"}? They can be restored later.`,
          confirmLabel: "Archive",
          loadingLabel: "Archiving...",
          confirmVariant: "danger" as const,
        };
      case "restore":
        return {
          title: "Restore selected jobs?",
          description: `Restore ${count} archived job${count === 1 ? "" : "s"}?`,
          confirmLabel: "Restore",
          loadingLabel: "Restoring...",
          confirmVariant: "success" as const,
        };
      case "permanent-delete":
        return {
          title: "Permanently delete selected jobs?",
          description: `You are about to permanently delete ${count} job${count === 1 ? "" : "s"}. This action cannot be undone.`,
          confirmLabel: "Permanently Delete",
          loadingLabel: "Deleting...",
          confirmVariant: "danger" as const,
        };
      default:
        return {
          title: "",
          description: "",
          confirmLabel: "Confirm",
          loadingLabel: "Processing...",
          confirmVariant: "primary" as const,
        };
    }
  }, [bulkConfirmAction, eligibleBulkIds.length]);

  useEffect(() => {
    setSelectedIds([]);
  }, [filters.page, filters.pageSize, filters.status, filters.search]);

  const handleBulkConfirm = async () => {
    if (!bulkConfirmAction || eligibleBulkIds.length === 0) {
      setBulkConfirmAction(null);
      return;
    }

    let result = null;

    switch (bulkConfirmAction) {
      case "activate":
        result = await bulkActivateJobs(eligibleBulkIds);
        if (result) {
          if (result.failedCount === 0) {
            appToast.success(
              formatBulkResultToast(result, "job(s) activated successfully"),
            );
          } else {
            appToast.error(
              formatBulkResultToast(result, "job(s) activated successfully"),
            );
          }
        }
        break;
      case "deactivate":
        result = await bulkDeactivateJobs(eligibleBulkIds);
        if (result) {
          if (result.failedCount === 0) {
            appToast.success(
              formatBulkResultToast(result, "job(s) deactivated successfully"),
            );
          } else {
            appToast.error(
              formatBulkResultToast(result, "job(s) deactivated successfully"),
            );
          }
        }
        break;
      case "archive":
        result = await bulkArchiveJobs(eligibleBulkIds);
        if (result) {
          if (result.failedCount === 0) {
            appToast.success(
              formatBulkResultToast(result, "job(s) archived successfully"),
            );
          } else {
            appToast.error(
              formatBulkResultToast(result, "job(s) archived successfully"),
            );
          }
        }
        break;
      case "restore":
        result = await bulkRestoreJobs(eligibleBulkIds);
        if (result) {
          if (result.failedCount === 0) {
            appToast.success(
              formatBulkResultToast(result, "job(s) restored successfully"),
            );
          } else {
            appToast.error(
              formatBulkResultToast(result, "job(s) restored successfully"),
            );
          }
        }
        break;
      case "permanent-delete":
        result = await bulkPermanentDeleteJobs(eligibleBulkIds);
        if (result) {
          if (result.failedCount === 0) {
            appToast.success(
              formatBulkResultToast(result, "job(s) permanently deleted"),
            );
          } else {
            appToast.error(
              formatBulkResultToast(result, "job(s) permanently deleted"),
            );
          }
        }
        break;
    }

    if (result) {
      setSelectedIds([]);
      setBulkConfirmAction(null);
      await refetch();
    }
  };

  const setTab = (nextTab: JobsModuleTab) => {
    if (nextTab === "onboarding") {
      router.replace("/jobs?tab=onboarding");
      return;
    }

    if (nextTab === "applications") {
      router.replace("/jobs?tab=applications");
      return;
    }

    router.replace("/jobs");
  };

  const copyApplicationLink = async (job: Job) => {
    try {
      await navigator.clipboard.writeText(getJobApplicationUrl(job.slug));
      appToast.success("Application link copied.");
    } catch {
      appToast.error("Unable to copy the application link.");
    }
  };

  const openApplicationPage = (job: Job) => {
    window.open(getJobApplicationUrl(job.slug), "_blank", "noopener,noreferrer");
  };

  const runAction = async () => {
    if (!selectedJob || !confirmAction) {
      return;
    }

    try {
      setIsActing(true);

      if (confirmAction === "activate") {
        await jobService.activateJob(selectedJob.id);
        appToast.success("Job activated successfully.");
      } else if (confirmAction === "deactivate") {
        await jobService.deactivateJob(selectedJob.id);
        appToast.success("Job deactivated successfully.");
      } else if (confirmAction === "archive") {
        await jobService.deleteJob(selectedJob.id);
        appToast.success("Job archived successfully.");
      } else {
        await jobService.restoreJob(selectedJob.id);
        appToast.success("Job restored successfully.");
      }

      setConfirmAction(null);
      setSelectedJob(undefined);
      await refetch();
    } catch (err) {
      appToast.error(err instanceof Error ? err.message : "Action failed.");
    } finally {
      setIsActing(false);
    }
  };

  const handleJobSubmit = async (
    values: CreateJobRequest,
    image: File | null,
    removeImage: boolean,
  ) => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (dialogMode === "edit" && editingJob) {
        await jobService.updateJob(
          editingJob.id,
          {
            ...values,
            companyLogo: removeImage && !image ? "" : values.companyLogo,
          },
          image,
        );
        appToast.success("Job updated successfully.");
      } else {
        const created = await jobService.createJob(values, image);
        appToast.success(
          created.data.jobNumber
            ? `Job created successfully. ${created.data.jobNumber}`
            : "Job created successfully.",
        );
      }

      setDialogOpen(false);
      setEditingJob(undefined);
      await refetch();
    } catch (err) {
      appToast.error(
        err instanceof Error ? err.message : "Unable to save job.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <JobSummaryHeader
        tab={tab}
        onTabChange={setTab}
        total={headerTotal}
        pendingOnboardingCount={onboarding.pendingCount}
        pendingApplicationCount={applications.pendingCount}
        isLoading={headerLoading}
        createDisabled={actionLoading}
        onCreate={() => {
          setDialogMode("create");
          setEditingJob(undefined);
          setDialogOpen(true);
        }}
        onCopyOnboardingLink={() => {
          const url = getCompanyOnboardingUrl();
          void navigator.clipboard.writeText(url).then(
            () => {
              appToast.success("Company onboarding link copied.");
            },
            () => {
              appToast.error("Unable to copy the onboarding link.");
            },
          );
        }}
        search={headerSearch}
        onSearchChange={(search) => {
          if (tab === "onboarding") {
            onboarding.setFilters({ ...onboarding.filters, search });
            return;
          }

          if (tab === "applications") {
            applications.setFilters({ ...applications.filters, search });
            return;
          }

          setFilters({ ...filters, search });
        }}
        jobStatus={filters.status}
        onJobStatusChange={(status) => setFilters({ ...filters, status })}
        onboardingStatus={onboarding.filters.status}
        onOnboardingStatusChange={(status) =>
          onboarding.setFilters({ ...onboarding.filters, status })
        }
      />

      {tab === "jobs" && onboarding.pendingCount > 0 ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          New Job Submission — {onboarding.pendingCount} hiring{" "}
          {onboarding.pendingCount === 1 ? "requirement is" : "requirements are"}{" "}
          awaiting review.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => setTab("onboarding")}
          >
            Review
          </button>
        </div>
      ) : null}

      {tab === "jobs" && applications.pendingCount > 0 ? (
        <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          New Job Application — {applications.pendingCount} candidate{" "}
          {applications.pendingCount === 1
            ? "application is"
            : "applications are"}{" "}
          pending review.{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => setTab("applications")}
          >
            Review
          </button>
        </div>
      ) : null}

      {tab === "onboarding" ? (
        <JobsOnboardingPanel
          jobs={onboarding.jobs}
          total={onboarding.total}
          isInitialLoading={onboarding.isInitialLoading}
          isFetching={onboarding.isFetching}
          error={onboarding.error}
          filters={onboarding.filters}
          setFilters={onboarding.setFilters}
          refetch={onboarding.refetch}
          onCatalogRefresh={refetch}
          actionsDisabled={isActing || isSubmitting}
        />
      ) : tab === "applications" ? (
        <JobsApplicationsPanel
          applications={applications.jobApplications}
          total={applications.total}
          statusCounts={applications.statusCounts}
          isInitialLoading={applications.isInitialLoading}
          isFetching={applications.isFetching}
          error={applications.error}
          filters={applications.filters}
          setFilters={applications.setFilters}
          refetch={applications.refetch}
          actionsDisabled={isActing}
        />
      ) : (
        <div className="mt-5">
          <Card className="overflow-hidden p-0">
            {isInitialLoading ? (
              <div className="p-4">
                <SkeletonTable rows={8} />
              </div>
            ) : (
              <>
                <div className="px-4 pt-4 empty:hidden">
                  <JobBulkActionsToolbar
                    jobs={jobs}
                    selectedJobIds={selectedIds}
                    disabled={actionLoading || isFetching}
                    onAction={setBulkConfirmAction}
                  />
                </div>

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
                  <JobTable
                    jobs={jobs}
                    selectedJobIds={selectedIds}
                    onSelectionChange={setSelectedIds}
                    actionsDisabled={actionLoading || isFetching}
                    selectionDisabled={actionLoading || isFetching}
                    onView={setViewJob}
                    onEdit={(job) => {
                      setDialogMode("edit");
                      setEditingJob(job);
                      setDialogOpen(true);
                    }}
                    onCopyLink={(job) => {
                      void copyApplicationLink(job);
                    }}
                    onOpenLink={openApplicationPage}
                    onActivate={(job) => {
                      setSelectedJob(job);
                      setConfirmAction("activate");
                    }}
                    onDeactivate={(job) => {
                      setSelectedJob(job);
                      setConfirmAction("deactivate");
                    }}
                    onArchive={(job) => {
                      setSelectedJob(job);
                      setConfirmAction("archive");
                    }}
                    onRestore={(job) => {
                      setSelectedJob(job);
                      setConfirmAction("restore");
                    }}
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
                          <span className="whitespace-nowrap">
                            Rows per page
                          </span>
                          <select
                            className="h-9 rounded-xl border border-[#DCE8F5] bg-white px-2 text-[15px] text-[#102A56]"
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
                      No jobs to paginate
                    </p>
                  )}
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      <JobDialog
        open={dialogOpen}
        mode={dialogMode}
        job={editingJob}
        isSubmitting={isSubmitting}
        onClose={() => {
          if (isSubmitting) {
            return;
          }
          setDialogOpen(false);
          setEditingJob(undefined);
        }}
        onSubmit={handleJobSubmit}
      />

      <JobViewDrawer
        open={Boolean(viewJob)}
        job={viewJob}
        onClose={() => setViewJob(undefined)}
      />

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={confirmCopy.title}
        description={confirmCopy.description}
        loading={isActing}
        confirmVariant={
          confirmAction === "activate" || confirmAction === "restore"
            ? "success"
            : confirmAction === "archive"
              ? "danger"
              : "primary"
        }
        onConfirm={() => {
          void runAction();
        }}
        onCancel={() => {
          if (isActing) {
            return;
          }
          setConfirmAction(null);
          setSelectedJob(undefined);
        }}
      />

      <ConfirmDialog
        open={bulkConfirmAction !== null}
        title={bulkDialogCopy.title}
        description={bulkDialogCopy.description}
        confirmLabel={bulkDialogCopy.confirmLabel}
        loadingLabel={bulkDialogCopy.loadingLabel}
        confirmVariant={bulkDialogCopy.confirmVariant}
        loading={bulkActionLoading}
        onCancel={() => {
          if (!bulkActionLoading) {
            setBulkConfirmAction(null);
          }
        }}
        onConfirm={() => {
          void handleBulkConfirm();
        }}
      />
    </div>
  );
}
