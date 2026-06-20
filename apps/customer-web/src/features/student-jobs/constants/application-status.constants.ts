import type {
  ApplicationStatus,
} from "@/src/features/student-jobs/types";

export const APPLICATION_STATUS_LABELS: Record<
  ApplicationStatus,
  string
> = {
  APPLIED: "Applied",

  UNDER_REVIEW: "Under Review",

  SHORTLISTED: "Shortlisted",

  INTERVIEW_SCHEDULED:
    "Interview Scheduled",

  INTERVIEWED: "Interviewed",

  SELECTED: "Selected",

  REJECTED: "Rejected",

  HIRED: "Hired",

  WITHDRAWN: "Withdrawn",
};