import type {
  JobApplicationStatus,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationStatusBadgeProps {
  status: JobApplicationStatus;
}

const STATUS_STYLES: Record<
  JobApplicationStatus,
  string
> = {
  APPLIED:
    "bg-gray-100 text-gray-700 border-gray-200",

  SHORTLISTED:
    "bg-blue-100 text-blue-700 border-blue-200",

  ASSESSMENT:
    "bg-yellow-100 text-yellow-700 border-yellow-200",

  INTERVIEW:
    "bg-purple-100 text-purple-700 border-purple-200",

  SELECTED:
    "bg-green-100 text-green-700 border-green-200",

  PLACED:
    "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function JobApplicationStatusBadge({
  status,
}: JobApplicationStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}