import { AxiosError } from "axios";

import { getErrorMessage, getErrorStatus } from "@/src/core/utils/get-error-message";

import {
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "@/src/features/jobs/constants/job.constants";
import type { Job } from "@/src/features/jobs/types/job.types";
import { formatInr } from "@/src/features/jobs/utils/job-form.utils";

export function getApiCode(error: unknown): string | undefined {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { code?: string } | undefined;
    return data?.code;
  }
  return undefined;
}

export function mapApplicationSubmitError(error: unknown): string {
  const code = getApiCode(error);
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  if (code === "JOB_ALREADY_APPLIED" || status === 409) {
    return "An application with this email already exists for this job.";
  }

  if (code === "JOB_EXPIRED") {
    return "Applications for this job are closed. The deadline has passed.";
  }

  if (code === "JOB_INACTIVE" || code === "JOB_CLOSED") {
    return "This position is currently not accepting applications.";
  }

  if (code === "JOB_NOT_FOUND" || code === "JOB_DELETED" || status === 404) {
    return "This job is no longer available.";
  }

  if (code === "VALIDATION_ERROR") {
    return message || "Please check the form and try again.";
  }

  if (status === 401 || status === 403) {
    return "You are not authorized to submit this application.";
  }

  if (!message || message === "Network Error") {
    return "Unable to connect. Check your internet connection and try again.";
  }

  return message;
}

export function employmentLabel(type: string) {
  return (
    EMPLOYMENT_TYPES.find((item) => item.value === type)?.label ??
    type.replaceAll("_", " ")
  );
}

export function workModeLabel(mode: string) {
  return WORK_MODES.find((item) => item.value === mode)?.label ?? mode;
}

export function experienceLabel(job: Job) {
  const min = job.minExperience ?? 0;
  const max = job.maxExperience;
  if (max == null || max === min) {
    return `${min} yr${min === 1 ? "" : "s"}`;
  }
  return `${min}–${max} yrs`;
}

export function salaryLabel(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return null;
  }
  if (job.maxSalary == null || job.maxSalary === job.minSalary) {
    return formatInr(job.minSalary);
  }
  return `${formatInr(job.minSalary)} – ${formatInr(job.maxSalary)}`;
}

export function deadlineLabel(value: string | null) {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
