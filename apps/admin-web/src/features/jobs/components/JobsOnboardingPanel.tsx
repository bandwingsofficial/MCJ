"use client";

import { useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";
import { Modal } from "@/src/shared/components/ui/model";

import { JobStatusBadge } from "@/src/features/jobs/components/JobStatusBadge";
import { JobViewDrawer } from "@/src/features/jobs/components/JobViewDrawer";
import { EMPLOYMENT_TYPES } from "@/src/features/jobs/constants/job.constants";
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

  const acceptCopy = useMemo(
    () => ({
      title: "Accept this job submission?",
      description:
        "This will generate a job number and publish the job to the catalog.",
    }),
    [],
  );

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
          ? `Job approved successfully. ${result.data.jobNumber}`
          : "Job approved successfully.",
      );
      setConfirmAccept(false);
      setDetailsOpen(false);
      setSelectedJob(null);
      await refetch();
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
                {jobs.length === 0 ? (
                  <EmptyState
                    title="No Job Submissions"
                    description="Company hiring requirements submitted from /onboarding/job will appear here."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead className="sticky top-0 z-10 border-b border-slate-200 bg-[#F6F9FD]">
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
                              className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                            >
                              {label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {jobs.map((job) => {
                          const pending = job.status === "PENDING_APPROVAL";

                          return (
                          <tr
                            key={job.id}
                            className="h-14 bg-white transition-colors hover:bg-[#F8FBFF]"
                          >
                            <td className="px-3 py-3 text-sm font-medium text-[#102A56]">
                              {job.companyName}
                            </td>
                            <td className="px-3 py-3 text-sm text-[#102A56]">
                              {job.title}
                            </td>
                            <td className="px-3 py-3 text-sm text-[#102A56]">
                              {job.category || "—"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-[#102A56]">
                              {EMPLOYMENT_TYPES.find(
                                (item) => item.value === job.employmentType,
                              )?.label ?? job.employmentType}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums text-[#102A56]">
                              {salaryLabel(job)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-[#102A56]">
                              {experienceLabel(job)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums text-[#102A56]">
                              {job.vacancies}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-[#647A9B]">
                              {new Date(job.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <JobStatusBadge variant="onboarding" job={job} />
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={actionsDisabled || isActing}
                                  onClick={() => openReview(job)}
                                >
                                  View
                                </Button>
                                {pending ? (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      className="admin-create-btn"
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
                                      size="sm"
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
                              </div>
                            </td>
                          </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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
                    No submissions to paginate
                  </p>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

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
          pendingJob ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isActing}
                onClick={() => setRejectOpen(true)}
              >
                Reject
              </Button>
              <Button
                type="button"
                className="admin-create-btn"
                disabled={isActing}
                loading={isActing}
                onClick={() => setConfirmAccept(true)}
              >
                Accept Job
              </Button>
            </>
          ) : undefined
        }
      />

      <ConfirmDialog
        open={confirmAccept}
        title={acceptCopy.title}
        description={acceptCopy.description}
        confirmLabel="Accept Job"
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
          This submission will be kept for history and will not become a catalog
          job.
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
