"use client";

import { useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";
import { Modal } from "@/src/shared/components/ui/model";

import { EmploymentTypeBadge } from "@/src/features/jobs/components/EmploymentTypeBadge";
import { JobStatusBadge } from "@/src/features/jobs/components/JobStatusBadge";
import { JobViewDrawer } from "@/src/features/jobs/components/JobViewDrawer";
import type { JobOnboardingFilters } from "@/src/features/jobs/types/job.types";
import type { Job } from "@/src/features/jobs/types/job.types";
import { jobService } from "@/src/features/jobs/services/job.service";
import { formatInr } from "@/src/features/jobs/utils/job-form.utils";

interface JobsOnboardingPanelProps {
  jobs: Job[];
  total: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filters: JobOnboardingFilters;
  setFilters: (filters: JobOnboardingFilters) => void;
  refetch: () => Promise<void>;
  /** Refresh Jobs catalog after accept so the job appears immediately. */
  onCatalogRefresh?: () => Promise<void>;
  actionsDisabled?: boolean;
}

function salaryLabel(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return "—";
  }

  if (job.maxSalary == null || job.maxSalary === job.minSalary) {
    return formatInr(job.minSalary);
  }

  return `${formatInr(job.minSalary)} – ${formatInr(job.maxSalary)}`;
}

function experienceLabel(job: Job) {
  const min = job.minExperience ?? 0;
  const max = job.maxExperience;

  if (max == null || max === min) {
    return `${min} yr${min === 1 ? "" : "s"}`;
  }

  return `${min}–${max} yrs`;
}

export function JobsOnboardingPanel({
  jobs,
  total,
  isInitialLoading,
  isFetching,
  error,
  filters,
  setFilters,
  refetch,
  onCatalogRefresh,
  actionsDisabled = false,
}: JobsOnboardingPanelProps) {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isActing, setIsActing] = useState(false);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pendingJob = selectedJob?.status === "PENDING_APPROVAL";
  const rejectedJob = selectedJob?.status === "REJECTED";
  const canAccept = pendingJob || rejectedJob;

  const acceptCopy = useMemo(() => {
    if (rejectedJob) {
      return {
        title: "Accept this rejected submission again?",
        description:
          "This will activate the same job record, generate a job number if needed, and publish it to the Jobs catalog.",
        confirmLabel: "Accept Again",
        successVerb: "accepted again",
      };
    }

    return {
      title: "Accept this job submission?",
      description:
        "This will generate a job number and publish the job to the Jobs catalog. It will leave the Onboarding queue.",
      confirmLabel: "Accept Job",
      successVerb: "approved",
    };
  }, [rejectedJob]);

  const openReview = (job: Job) => {
    setSelectedJob(job);
    setDetailsOpen(true);
  };

  const runAccept = async () => {
    if (!selectedJob) {
      return;
    }

    try {
      setIsActing(true);
      const result = await jobService.approveJob(selectedJob.id);
      appToast.success(
        result.data.jobNumber
          ? `Job ${acceptCopy.successVerb} successfully. ${result.data.jobNumber}`
          : `Job ${acceptCopy.successVerb} successfully.`,
      );
      setConfirmAccept(false);
      setDetailsOpen(false);
      setSelectedJob(null);
      await Promise.all([refetch(), onCatalogRefresh?.()]);
    } catch (err) {
      appToast.error(
        err instanceof Error ? err.message : "Unable to approve this job.",
      );
    } finally {
      setIsActing(false);
    }
  };

  const runReject = async () => {
    if (!selectedJob) {
      return;
    }

    try {
      setIsActing(true);
      await jobService.rejectJob(selectedJob.id, rejectReason.trim());
      appToast.success("Job submission rejected.");
      setRejectOpen(false);
      setRejectReason("");
      setDetailsOpen(false);
      setSelectedJob(null);
      await refetch();
    } catch (err) {
      appToast.error(
        err instanceof Error ? err.message : "Unable to reject this job.",
      );
    } finally {
      setIsActing(false);
    }
  };

  return (
    <>
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
                  <span className="sr-only">Updating submissions</span>
                ) : null}
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                      <tr>
                        {[
                          "Company",
                          "Job Title",
                          "Category",
                          "Job Type",
                          "Salary",
                          "Experience",
                          "Openings",
                          "Submitted Date",
                          "Status",
                          "Actions",
                        ].map((label) => (
                          <th
                            key={label}
                            className={`whitespace-nowrap !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide ${
                              label === "Actions"
                                ? "w-[9rem] !px-8 text-right text-slate-500"
                                : "text-[#526581]"
                            }`}
                          >
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {jobs.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="!px-4 !py-4 align-middle">
                            <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                              <h3 className="text-base font-semibold">
                                No Job Submissions
                              </h3>
                              <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                                Company hiring requirements submitted from
                                /onboarding/job will appear here.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        jobs.map((job) => {
                          const pending = job.status === "PENDING_APPROVAL";
                          const rejected = job.status === "REJECTED";

                          return (
                            <tr
                              key={job.id}
                              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                            >
                              <td className="!px-4 !py-4 align-middle text-sm font-medium leading-snug text-[#102A56]">
                                {job.companyName}
                              </td>
                              <td className="!px-4 !py-4 align-middle text-sm text-[#102A56]">
                                {job.title}
                              </td>
                              <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                                {job.category || "—"}
                              </td>
                              <td className="whitespace-nowrap !px-4 !py-4 align-middle">
                                <EmploymentTypeBadge type={job.employmentType} />
                              </td>
                              <td className="whitespace-nowrap !px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                                {salaryLabel(job)}
                              </td>
                              <td className="whitespace-nowrap !px-4 !py-4 align-middle text-sm text-slate-700">
                                {experienceLabel(job)}
                              </td>
                              <td className="whitespace-nowrap !px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                                {job.vacancies}
                              </td>
                              <td className="whitespace-nowrap !px-4 !py-4 align-middle text-sm text-[#647A9B]">
                                {new Date(job.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="!px-4 !py-4 align-middle">
                                <JobStatusBadge variant="onboarding" job={job} />
                              </td>
                              <td className="!px-8 !py-4 text-right align-middle">
                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="h-7 px-2.5 text-xs"
                                    disabled={actionsDisabled || isActing}
                                    onClick={() => openReview(job)}
                                  >
                                    View
                                  </Button>
                                  {pending ? (
                                    <>
                                      <Button
                                        type="button"
                                        className="h-7 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-2.5 text-xs font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:from-[#0284C7] hover:to-[#1D4ED8]"
                                        disabled={actionsDisabled || isActing}
                                        onClick={() => {
                                          setSelectedJob(job);
                                          setConfirmAccept(true);
                                        }}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="h-7 px-2.5 text-xs"
                                        disabled={actionsDisabled || isActing}
                                        onClick={() => {
                                          setSelectedJob(job);
                                          setRejectReason("");
                                          setRejectOpen(true);
                                        }}
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  ) : null}
                                  {rejected ? (
                                    <Button
                                      type="button"
                                      className="h-7 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-2.5 text-xs font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:from-[#0284C7] hover:to-[#1D4ED8]"
                                      disabled={actionsDisabled || isActing}
                                      onClick={() => {
                                        setSelectedJob(job);
                                        setConfirmAccept(true);
                                      }}
                                    >
                                      Accept Again
                                    </Button>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
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

      <JobViewDrawer
        open={detailsOpen}
        job={selectedJob}
        title="Review Job Submission"
        onClose={() => {
          if (isActing) {
            return;
          }
          setDetailsOpen(false);
        }}
        footer={
          canAccept ? (
            <>
              {pendingJob ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isActing}
                  onClick={() => setRejectOpen(true)}
                >
                  Reject
                </Button>
              ) : null}
              <Button
                type="button"
                className="admin-create-btn"
                disabled={isActing}
                loading={isActing}
                onClick={() => setConfirmAccept(true)}
              >
                {rejectedJob ? "Accept Again" : "Accept Job"}
              </Button>
            </>
          ) : undefined
        }
      />

      <ConfirmDialog
        open={confirmAccept}
        title={acceptCopy.title}
        description={acceptCopy.description}
        confirmLabel={acceptCopy.confirmLabel}
        loading={isActing}
        confirmVariant="success"
        onConfirm={() => {
          void runAccept();
        }}
        onCancel={() => {
          if (!isActing) {
            setConfirmAccept(false);
          }
        }}
      />

      <Modal
        open={rejectOpen}
        title="Reject Job Submission"
        onClose={() => {
          if (!isActing) {
            setRejectOpen(false);
          }
        }}
        contentClassName="!max-w-[520px]"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={isActing}
              onClick={() => setRejectOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={isActing}
              disabled={isActing}
              onClick={() => {
                void runReject();
              }}
            >
              Reject
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#647A9B]">
          This submission stays in Onboarding as Rejected. No Job Number is
          generated and it will not appear in the Jobs catalog. You can Accept
          Again later.
        </p>
        <label className="mt-4 block text-sm font-medium text-[#102A56]">
          Rejection reason (optional)
        </label>
        <Textarea
          className="mt-1.5"
          rows={3}
          value={rejectReason}
          disabled={isActing}
          placeholder="Missing salary details, incomplete company information..."
          onChange={(event) => setRejectReason(event.target.value)}
        />
      </Modal>
    </>
  );
}
