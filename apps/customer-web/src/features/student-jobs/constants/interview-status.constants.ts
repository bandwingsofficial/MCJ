export type JobApplicationInterviewStatus =
  | "NOT_YET"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "SELECTED"
  | "REJECTED"
  | "PLACED";

export const INTERVIEW_STATUS_LABELS: Record<
  JobApplicationInterviewStatus,
  string
> = {
  NOT_YET: "Not Yet",
  INTERVIEW_SCHEDULED: "Interview Scheduled",
  INTERVIEWED: "Interviewed",
  SELECTED: "Selected",
  REJECTED: "Rejected",
  PLACED: "Placed",
};
