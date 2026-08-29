"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { appToast } from "@/src/shared/components/ui/toast";

import { JobDialog } from "@/src/features/jobs/components/JobDialog";
import { JobSummaryHeader } from "@/src/features/jobs/components/job-summary-header";
import type { JobsModuleTab } from "@/src/features/jobs/components/job-summary-header";
import { JobTable } from "@/src/features/jobs/components/JobTable";
import { JobViewDrawer } from "@/src/features/jobs/components/JobViewDrawer";
import { JobsApplicationsPanel } from "@/src/features/jobs/components/JobsApplicationsPanel";
import { JobsOnboardingPanel } from "@/src/features/jobs/components/JobsOnboardingPanel";
import { DEFAULT_JOB_PAGE_SIZE } from "@/src/features/jobs/constants/job.constants";
import { useJobOnboarding, useJobs } from "@/src/features/jobs/hooks/useJobs";
import { jobService } from "@/src/features/jobs/services/job.service";
import type {
  CreateJobRequest,
  Job,
} from "@/src/features/jobs/types/job.types";
import { getCompanyOnboardingUrl, getJobApplicationUrl } from "@/src/features/jobs/utils/job-form.utils";
import { useJobApplications } from "@/src/features/job-applications/hooks/useJobApplications";
import type { OnboardingStatusFilter } from "@/src/features/job-applications/types/job-application.types";

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
        createDisabled={isActing || isSubmitting}
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
        applicationStatus={applications.filters.status}
        onApplicationStatusChange={(status: OnboardingStatusFilter) =>
          applications.setFilters({ ...applications.filters, status })
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
                    actionsDisabled={isActing || isFetching || isSubmitting}
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
    </div>
  );
}
