import { getJobLifecycleStatus } from "@/src/features/jobs/hooks/useJobs";
import type {
  BulkJobOperationResult,
  Job,
} from "@/src/features/jobs/types/job.types";

export function isArchivedJob(job: Pick<Job, "isDeleted">): boolean {
  return Boolean(job.isDeleted);
}

export function getEligibleActivateIds(
  jobs: Job[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return jobs
    .filter(
      (job) =>
        selected.has(job.id) &&
        !isArchivedJob(job) &&
        getJobLifecycleStatus(job) === "INACTIVE",
    )
    .map((job) => job.id);
}

export function getEligibleDeactivateIds(
  jobs: Job[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return jobs
    .filter(
      (job) =>
        selected.has(job.id) &&
        !isArchivedJob(job) &&
        getJobLifecycleStatus(job) === "ACTIVE",
    )
    .map((job) => job.id);
}

export function getEligibleArchiveIds(
  jobs: Job[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return jobs
    .filter((job) => selected.has(job.id) && !isArchivedJob(job))
    .map((job) => job.id);
}

export function getEligibleRestoreIds(
  jobs: Job[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return jobs
    .filter((job) => selected.has(job.id) && isArchivedJob(job))
    .map((job) => job.id);
}

export function getEligiblePermanentDeleteIds(
  jobs: Job[],
  selectedIds: string[],
): string[] {
  return getEligibleRestoreIds(jobs, selectedIds);
}

export function formatBulkResultToast(
  result: BulkJobOperationResult,
  successLabel: string,
): string {
  if (result.failedCount === 0) {
    return `${result.successCount} ${successLabel}`;
  }

  const failurePreview = result.failures
    .slice(0, 2)
    .map((item) => item.message)
    .join(" ");

  return `${result.successCount} ${successLabel}. ${result.failedCount} failed.${failurePreview ? ` ${failurePreview}` : ""}`;
}
