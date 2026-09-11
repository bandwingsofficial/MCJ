"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { JobDialog } from "@/src/features/jobs/components/JobDialog";
import {
  type BulkJobAction,
} from "@/src/features/jobs/components/job-bulk-actions-toolbar";
import { JobSummaryHeader } from "@/src/features/jobs/components/job-summary-header";
import type { JobsModuleTab } from "@/src/features/jobs/components/job-summary-header";
import { JobsCatalogPanel } from "@/src/features/jobs/components/jobs-catalog-panel";
import { JobViewDrawer } from "@/src/features/jobs/components/JobViewDrawer";
import { JobsOnboardingPanel } from "@/src/features/jobs/components/JobsOnboardingPanel";
import { useBulkJobActions } from "@/src/features/jobs/hooks/use-bulk-job-actions";
import { useJobOnboarding, useJobs } from "@/src/features/jobs/hooks/useJobs";
import { jobService } from "@/src/features/jobs/services/job.service";
import type {
  CreateJobRequest,
  Job,
} from "@/src/features/jobs/types/job.types";
import { getCompanyOnboardingUrl } from "@/src/features/jobs/utils/job-form.utils";
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

  if (value === "expired") {
    return "expired";
  }

  return "jobs";
}

export function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("tab"));

  const activeCatalog = useJobs({ expiryMode: "exclude-expired" });
  const expiredCatalog = useJobs({ expiryMode: "expired-only" });
  const onboarding = useJobOnboarding();
  const applications = useJobApplications();

  const catalog =
    tab === "expired" ? expiredCatalog : activeCatalog;

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
  } = catalog;

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

  useEffect(() => {
    if (searchParams.get("tab") === "applications") {
      router.replace("/job-applications");
    }
  }, [router, searchParams]);

  useEffect(() => {
    setSelectedIds([]);
  }, [tab, filters.page, filters.pageSize, filters.status, filters.search]);

  const headerLoading =
    tab === "jobs" || tab === "expired"
      ? isInitialLoading
      : onboarding.isInitialLoading;

  const headerSearch =
    tab === "onboarding"
      ? onboarding.filters.search
      : filters.search;

  const headerTotal =
    tab === "expired" ? expiredCatalog.catalogTotal : activeCatalog.catalogTotal;

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

  const refreshCatalogs = async () => {
    await Promise.all([activeCatalog.refetch(), expiredCatalog.refetch()]);
  };

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
      await refreshCatalogs();
    }
  };

  const setTab = (nextTab: JobsModuleTab) => {
    if (nextTab === "onboarding") {
      router.replace("/jobs?tab=onboarding");
      return;
    }

    if (nextTab === "expired") {
      router.replace("/jobs?tab=expired");
      return;
    }

    router.replace("/jobs");
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
      await refreshCatalogs();
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
      await refreshCatalogs();
    } catch (err) {
      appToast.error(
        err instanceof Error ? err.message : "Unable to save job.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const catalogPanelProps = {
    jobs,
    total,
    isInitialLoading,
    isFetching,
    error,
    filters,
    setFilters,
    refetch,
    selectedIds,
    onSelectionChange: setSelectedIds,
    actionLoading,
    onBulkAction: setBulkConfirmAction,
    onView: setViewJob,
    onEdit: (job: Job) => {
      setDialogMode("edit");
      setEditingJob(job);
      setDialogOpen(true);
    },
    onActivate: (job: Job) => {
      setSelectedJob(job);
      setConfirmAction("activate");
    },
    onDeactivate: (job: Job) => {
      setSelectedJob(job);
      setConfirmAction("deactivate");
    },
    onArchive: (job: Job) => {
      setSelectedJob(job);
      setConfirmAction("archive");
    },
    onRestore: (job: Job) => {
      setSelectedJob(job);
      setConfirmAction("restore");
    },
  };

  return (
    <div className="space-y-3">
      <JobSummaryHeader
        tab={tab}
        onTabChange={setTab}
        total={headerTotal}
        pendingOnboardingCount={onboarding.pendingCount}
        expiredCount={expiredCatalog.catalogTotal}
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

          setFilters({ ...filters, search, page: 1 });
        }}
        jobStatus={filters.status}
        onJobStatusChange={(status) =>
          setFilters({ ...filters, status, page: 1 })
        }
        onboardingStatus={onboarding.filters.status}
        onOnboardingStatusChange={(status) =>
          onboarding.setFilters({ ...onboarding.filters, status })
        }
      />

      {tab === "jobs" && onboarding.pendingCount > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
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
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          New Job Application — {applications.pendingCount} candidate{" "}
          {applications.pendingCount === 1
            ? "application is"
            : "applications are"}{" "}
          pending review.{" "}
          <Link href="/job-applications" className="font-semibold underline">
            Review
          </Link>
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
          onCatalogRefresh={refreshCatalogs}
          actionsDisabled={isActing || isSubmitting}
        />
      ) : tab === "jobs" || tab === "expired" ? (
        <JobsCatalogPanel {...catalogPanelProps} />
      ) : null}

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
