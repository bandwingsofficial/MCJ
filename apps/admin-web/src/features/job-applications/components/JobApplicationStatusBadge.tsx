import type { JobApplicationStatus } from "@/src/features/job-applications/types/job-application.types";
import { getOnboardingStatusLabel } from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationStatusBadgeProps {
  status: JobApplicationStatus;
}

const STATUS_STYLES: Record<JobApplicationStatus, string> = {
  APPLIED: "bg-[#F4F9FF] text-[#647A9B] border-[#DCE8F5]",
  SHORTLISTED: "bg-sky-50 text-sky-700 border-sky-100",
  ASSESSMENT: "bg-amber-50 text-amber-700 border-amber-100",
  INTERVIEW: "bg-violet-50 text-violet-700 border-violet-100",
  SELECTED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  PLACED: "bg-emerald-50 text-emerald-700 border-emerald-100",
  REJECTED: "bg-rose-50 text-rose-600 border-rose-100",
};

export function JobApplicationStatusBadge({
  status,
}: JobApplicationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {getOnboardingStatusLabel(status)}
    </span>
  );
}
