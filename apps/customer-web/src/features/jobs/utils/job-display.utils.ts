import type { Job } from "@/src/features/jobs/types/job.types";
import {
  EMPLOYMENT_TYPES,
  WORK_MODES,
  WORKING_DAYS,
} from "@/src/features/jobs/constants/job.constants";

export function salaryLabel(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return "Not disclosed";
  }

  const min = job.minSalary?.toLocaleString("en-IN");
  const max = job.maxSalary?.toLocaleString("en-IN");

  if (min && max && min !== max) {
    return `₹${min} - ₹${max}`;
  }

  return `₹${min ?? max}`;
}

export function locationLabel(job: Job) {
  if (job.location) {
    return job.location;
  }

  if (job.city) {
    return [job.city, job.state].filter(Boolean).join(", ");
  }

  if (job.isRemote) {
    return "Remote";
  }

  return "Location not specified";
}

export function experienceLabel(job: Job) {
  const min = job.minExperience ?? 0;

  if (job.maxExperience != null) {
    return `${min} - ${job.maxExperience} Years`;
  }

  return `${min} Years`;
}

export function employmentLabel(job: Job) {
  return (
    EMPLOYMENT_TYPES.find((item) => item.value === job.employmentType)?.label ??
    job.employmentType.replaceAll("_", " ")
  );
}

export function workModeLabel(job: Job) {
  return (
    WORK_MODES.find((item) => item.value === job.workMode)?.label ??
    (job.isRemote ? "Remote" : "On-site")
  );
}

export function workingDaysLabel(job: Job) {
  return (
    WORKING_DAYS.find((item) => item.value === job.workingDays)?.label ??
    job.workingDays.replaceAll("_", " ")
  );
}

export function formatPostedDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Today";
  }

  if (diffDays === 1) {
    return "Yesterday";
  }

  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDeadlineDate(dateStr: string | null) {
  if (!dateStr) {
    return "No deadline specified";
  }

  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function descriptionLabel(job: Job) {
  return (
    job.shortDescription?.trim() ||
    job.description?.trim() ||
    "Explore this opportunity and apply to join the team."
  );
}
