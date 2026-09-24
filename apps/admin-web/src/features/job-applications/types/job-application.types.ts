import { formatCanonicalInterviewerName } from "@/src/features/job-applications/utils/interviewer-display.utils";

export type JobApplicationStatus =
  | "APPLIED"
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "ASSESSMENT"
  | "INTERVIEW"
  | "SELECTED"
  | "PLACED"
  | "REJECTED";

export type JobApplicationInterviewStatus =
  | "NOT_YET"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "SELECTED"
  | "REJECTED"
  | "PLACED";

export interface JobSummary {
  id: string;
  title: string;
  slug: string;
  jobNumber?: string | null;
  companyName: string;
  status: string;
  employmentType: string;
}

export interface JobApplicationUserProfile {
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
}

export interface JobApplicationUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  profile: JobApplicationUserProfile | null;
}

export interface JobApplicationResume {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export interface JobApplicationBranchInterviewerAssignment {
  id: string;
  status: string;
  result?: string | null;
  evaluation?: string | null;
  branchId: string;
  interviewerId: string | null;
  roundId?: string | null;
  nextRoundId?: string | null;
  scheduledAt: string | null;
  mode?: string | null;
  locationOrLink?: string | null;
  roundNumber?: number;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
  branch?: {
    id: string;
    branchName: string;
    branchCode: string;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    postalCode?: string | null;
  } | null;
  interviewer?: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
  } | null;
  round?: {
    id: string;
    name: string;
    sortOrder: number;
  } | null;
  nextRound?: {
    id: string;
    name: string;
    sortOrder: number;
  } | null;
}

export interface JobApplicationStudent {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  qualification: string | null;
  collegeName: string | null;
  specialization: string | null;
  passingYear: number | null;
  parentName: string | null;
  parentPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  notes: string | null;
  status: string;
  jobStatus: string | null;
}

export interface JobApplication {
  id: string;
  jobId: string;
  studentId: string | null;
  applicationNumber: string;
  applicantName: string | null;
  applicantEmail: string | null;
  applicantPhone: string | null;
  highestQualification: string | null;
  yearsOfExperience: number | null;
  resumeFileId: string | null;
  coverLetter: string | null;
  currentLocation: string | null;
  expectedSalary: number | null;
  remarks: string | null;
  rejectionReason?: string | null;
  status: JobApplicationStatus;
  interviewStatus: JobApplicationInterviewStatus;
  isDeleted: boolean;
  deletedAt: string | null;
  job: JobSummary;
  user: JobApplicationUser | null;
  student: JobApplicationStudent | null;
  resolvedStudentCode?: string | null;
  interviewAssignment?: JobApplicationBranchInterviewerAssignment | null;
  /** Active Branch + Interviewer assignment (separate from interview round display). */
  branchInterviewerAssignment?: JobApplicationBranchInterviewerAssignment | null;
  interviews?: Array<JobApplicationBranchInterviewerAssignment>;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplicationListResponse {
  success: boolean;
  message: string;
  data: JobApplication[];
  meta?: {
    total?: number;
    skip?: number;
    take?: number;
  };
}

export interface JobApplicationResponse {
  success: boolean;
  message: string;
  data: JobApplication;
}

export interface UpdateJobApplicationStatusRequest {
  status: JobApplicationStatus;
  rejectionReason?: string;
}

export interface AssignInterviewRequest {
  branchId: string;
  interviewerId: string;
}

export interface DeleteJobApplicationResponse {
  success: boolean;
  message: string;
}

export interface RestoreJobApplicationResponse {
  success: boolean;
  message: string;
  data: JobApplication;
}

export function getApplicantName(application: JobApplication): string {
  if (application.student) {
    const fromStudent = [
      application.student.firstName,
      application.student.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
    if (fromStudent) {
      return fromStudent;
    }
  }

  if (application.user?.name?.trim()) {
    return application.user.name.trim();
  }

  if (application.applicantName?.trim()) {
    return application.applicantName.trim();
  }

  const profile = application.user?.profile;
  const fromProfile = [profile?.firstName, profile?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fromProfile || "Candidate";
}

export function getApplicantEmail(application: JobApplication): string {
  const email =
    application.student?.email?.trim() ||
    application.user?.email?.trim() ||
    application.applicantEmail?.trim() ||
    "";

  return email || "—";
}

export function getStudentCode(application: JobApplication): string {
  const code =
    application.student?.studentCode?.trim() ||
    application.resolvedStudentCode?.trim() ||
    "";

  return code || "—";
}

export function getApplicantPhone(application: JobApplication): string {
  const phone =
    application.student?.phone?.trim() ||
    application.user?.phone?.trim() ||
    application.applicantPhone?.trim() ||
    "";

  return phone || "—";
}

export type OnboardingStatusFilter = "PENDING" | "ACCEPTED" | "REJECTED";

export type JobApplicationStatusGroup =
  | "PENDING"
  | "SHORTLISTED"
  | "REJECTED";

/** Map admin tab filter → API statusGroup (matches persisted statuses). */
export function toJobApplicationStatusGroup(
  filter: OnboardingStatusFilter,
): JobApplicationStatusGroup {
  if (filter === "PENDING") {
    return "PENDING";
  }

  if (filter === "ACCEPTED") {
    return "SHORTLISTED";
  }

  return "REJECTED";
}

/**
 * @deprecated Prefer toJobApplicationStatusGroup — single status misses APPLIED / legacy SELECTED.
 */
export function toJobApplicationStatus(
  filter: OnboardingStatusFilter,
): JobApplicationStatus | undefined {
  if (filter === "PENDING") {
    return "UNDER_REVIEW";
  }

  if (filter === "ACCEPTED") {
    return "SHORTLISTED";
  }

  if (filter === "REJECTED") {
    return "REJECTED";
  }

  return undefined;
}

export function getInterviewStatusLabel(
  status: JobApplicationInterviewStatus,
): string {
  const labels: Record<JobApplicationInterviewStatus, string> = {
    NOT_YET: "NOT YET",
    INTERVIEW_SCHEDULED: "SCHEDULED",
    INTERVIEWED: "COMPLETED",
    SELECTED: "SELECTED",
    REJECTED: "REJECTED",
    PLACED: "PLACED",
  };

  return labels[status];
}

export type InterviewPipelineDisplayKey =
  | "NOT_YET"
  | "SCHEDULED"
  | "COMPLETED"
  | "SELECTED_FOR_NEXT_ROUND"
  | "REJECTED"
  | "ON_HOLD"
  | "NEED_FURTHER_REVIEW"
  | "PLACED"
  | "CANCELLED"
  | "NO_SHOW";

type InterviewRecordLike = {
  status?: string | null;
  result?: string | null;
  round?: { name?: string | null } | null;
  nextRound?: { name?: string | null } | null;
};

/**
 * Interview column status from the latest persisted Interview record
 * (status + result) — not from JobApplication.interviewStatus alone.
 */
export function resolveInterviewPipelineDisplay(
  interview?: InterviewRecordLike | null,
): {
  key: InterviewPipelineDisplayKey;
  label: string;
  variant: "success" | "warning" | "danger" | "info" | "default";
} {
  if (!interview) {
    return { key: "NOT_YET", label: "NOT YET", variant: "default" };
  }

  const status = (interview.status ?? "").toString().trim().toUpperCase();
  const result = (interview.result ?? "").toString().trim().toUpperCase();

  if (status === "ASSIGNED") {
    return { key: "NOT_YET", label: "NOT YET", variant: "default" };
  }

  if (status === "SCHEDULED") {
    return { key: "SCHEDULED", label: "SCHEDULED", variant: "info" };
  }

  if (status === "COMPLETED") {
    if (result === "SELECTED_FOR_NEXT_ROUND") {
      return {
        key: "SELECTED_FOR_NEXT_ROUND",
        label: "SELECTED FOR NEXT ROUND",
        variant: "success",
      };
    }
    if (result === "REJECTED") {
      return { key: "REJECTED", label: "REJECTED", variant: "danger" };
    }
    if (result === "ON_HOLD") {
      return { key: "ON_HOLD", label: "ON HOLD", variant: "warning" };
    }
    if (result === "NEED_FURTHER_REVIEW") {
      return {
        key: "NEED_FURTHER_REVIEW",
        label: "NEED FURTHER REVIEW",
        variant: "warning",
      };
    }
    if (result === "PLACED") {
      return { key: "PLACED", label: "PLACED", variant: "success" };
    }
    return { key: "COMPLETED", label: "COMPLETED", variant: "warning" };
  }

  if (status === "CANCELLED") {
    return { key: "CANCELLED", label: "CANCELLED", variant: "danger" };
  }

  if (status === "NO_SHOW") {
    return { key: "NO_SHOW", label: "NO SHOW", variant: "danger" };
  }

  return { key: "NOT_YET", label: "NOT YET", variant: "default" };
}

export function resolveApplicationInterviewDisplay(application: {
  interviewAssignment?: InterviewRecordLike | null;
  interviewStatus?: JobApplicationInterviewStatus | string | null;
}): {
  key: InterviewPipelineDisplayKey;
  label: string;
  variant: "success" | "warning" | "danger" | "info" | "default";
} {
  if (application.interviewAssignment) {
    return resolveInterviewPipelineDisplay(application.interviewAssignment);
  }

  const fallback = (application.interviewStatus ?? "NOT_YET")
    .toString()
    .trim()
    .toUpperCase();

  if (fallback === "INTERVIEW_SCHEDULED") {
    return { key: "SCHEDULED", label: "SCHEDULED", variant: "info" };
  }
  if (fallback === "INTERVIEWED") {
    return { key: "COMPLETED", label: "COMPLETED", variant: "warning" };
  }
  if (fallback === "REJECTED") {
    return { key: "REJECTED", label: "REJECTED", variant: "danger" };
  }
  if (fallback === "PLACED") {
    return { key: "PLACED", label: "PLACED", variant: "success" };
  }
  if (fallback === "SELECTED") {
    return { key: "COMPLETED", label: "SELECTED", variant: "success" };
  }

  return { key: "NOT_YET", label: "NOT YET", variant: "default" };
}

/** True when status is a legacy "approved as SELECTED" shortlist (pre-SHORTLISTED flow). */
export function isLegacyShortlistedSelected(
  status: JobApplicationStatus,
  interviewStatus?: JobApplicationInterviewStatus | string | null,
): boolean {
  if (status !== "SELECTED") {
    return false;
  }
  const interview = (interviewStatus ?? "NOT_YET").toString().trim().toUpperCase();
  return interview === "NOT_YET" || interview === "";
}

export function getOnboardingStatusLabel(
  status: JobApplicationStatus,
  interviewStatus?: JobApplicationInterviewStatus | string | null,
): string {
  if (status === "APPLIED" || status === "UNDER_REVIEW") {
    return "UNDER REVIEW";
  }

  // Apps in the shortlist / interview pipeline stay SHORTLISTED until a final outcome.
  if (
    status === "SHORTLISTED" ||
    status === "INTERVIEW" ||
    status === "ASSESSMENT" ||
    isLegacyShortlistedSelected(status, interviewStatus)
  ) {
    return "SHORTLISTED";
  }

  if (status === "REJECTED") {
    return "REJECTED";
  }

  if (status === "PLACED") {
    return "PLACED";
  }

  if (status === "SELECTED") {
    return "SELECTED";
  }

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function canApproveApplication(status: JobApplicationStatus): boolean {
  return (
    status === "APPLIED" ||
    status === "UNDER_REVIEW" ||
    status === "REJECTED"
  );
}

function isActiveBranchInterviewerAssignmentStatus(
  status: string | null | undefined,
): boolean {
  const normalized = (status ?? "").trim().toUpperCase();
  return normalized === "ASSIGNED" || normalized === "SCHEDULED";
}

/** Persisted Branch + Interviewer assignment (not interview outcome / rounds). */
export function getBranchInterviewerAssignment(
  application: Pick<
    JobApplication,
    "branchInterviewerAssignment" | "interviewAssignment" | "interviews"
  >,
): JobApplicationBranchInterviewerAssignment | null {
  if (application.branchInterviewerAssignment?.id) {
    return application.branchInterviewerAssignment;
  }

  const interviews = application.interviews ?? [];
  for (let index = interviews.length - 1; index >= 0; index -= 1) {
    const row = interviews[index];
    if (isActiveBranchInterviewerAssignmentStatus(row.status)) {
      return row;
    }
  }

  const fallback = application.interviewAssignment;
  if (
    fallback?.id &&
    isActiveBranchInterviewerAssignmentStatus(fallback.status)
  ) {
    return fallback;
  }

  return null;
}

export function getAssignedBranchName(
  assignment: JobApplicationBranchInterviewerAssignment | null | undefined,
): string {
  const name = assignment?.branch?.branchName?.trim();
  return name || "—";
}

export function getAssignedInterviewerName(
  assignment: JobApplicationBranchInterviewerAssignment | null | undefined,
): string {
  return formatCanonicalInterviewerName(assignment?.interviewer, "—");
}

export function isInterviewAssigned(application: Pick<
  JobApplication,
  "branchInterviewerAssignment" | "interviewAssignment" | "interviews"
>): boolean {
  return Boolean(getBranchInterviewerAssignment(application)?.id);
}

export function getAssignmentStatus(
  application: Pick<
    JobApplication,
    "branchInterviewerAssignment" | "interviewAssignment" | "interviews"
  >,
): "ASSIGNED" | "UNASSIGNED" {
  return isInterviewAssigned(application) ? "ASSIGNED" : "UNASSIGNED";
}

export function getAssignmentStatusLabel(
  status: "ASSIGNED" | "UNASSIGNED",
): string {
  return status;
}

const FINAL_RESULTS = new Set([
  "REJECTED",
  "PLACED",
  "ON_HOLD",
  "NEED_FURTHER_REVIEW",
]);

/** Current round label from the latest interview assignment. */
export function getCurrentRoundName(application: {
  interviewAssignment?: {
    round?: { name?: string | null } | null;
  } | null;
}): string {
  const name = application.interviewAssignment?.round?.name?.trim();
  if (name) {
    return name;
  }
  if (application.interviewAssignment) {
    return "Not Set";
  }
  return "Not Started";
}

/** Next round label from persisted nextRound / result progression. */
export function getNextRoundName(application: {
  interviewAssignment?: {
    status?: string | null;
    result?: string | null;
    round?: { name?: string | null } | null;
    nextRound?: { name?: string | null } | null;
  } | null;
  interviews?: Array<{
    result?: string | null;
    nextRound?: { name?: string | null } | null;
  }>;
}): string {
  const interview = application.interviewAssignment;
  if (!interview) {
    return "Not Started";
  }

  const result = (interview.result ?? "").toString().trim().toUpperCase();
  const status = (interview.status ?? "").toString().trim().toUpperCase();

  if (FINAL_RESULTS.has(result)) {
    return "No Further Round";
  }

  const fromAssignment = interview.nextRound?.name?.trim() || null;
  if (fromAssignment) {
    return fromAssignment;
  }

  const currentName = interview.round?.name?.trim() || null;
  const interviews = application.interviews ?? [];

  for (let index = interviews.length - 1; index >= 0; index -= 1) {
    const item = interviews[index];
    if (item.result !== "SELECTED_FOR_NEXT_ROUND") {
      continue;
    }
    const nextName = item.nextRound?.name?.trim() || null;
    if (!nextName) {
      continue;
    }
    // Already progressed onto that round — no longer "next".
    if (currentName && currentName === nextName) {
      if (status === "SCHEDULED" || status === "ASSIGNED") {
        return "Not Set";
      }
      continue;
    }
    return nextName;
  }

  if (result === "SELECTED_FOR_NEXT_ROUND") {
    return "Not Set";
  }

  if (status === "COMPLETED" || status === "SCHEDULED" || status === "ASSIGNED") {
    return "Not Set";
  }

  return "Not Set";
}

/** Shortlisted / interview-pipeline applications can open assign / manage assignment. */
export function canManageAssignment(application: {
  status: JobApplicationStatus;
  interviewStatus?: JobApplicationInterviewStatus | string | null;
}): boolean {
  return (
    application.status === "SHORTLISTED" ||
    application.status === "INTERVIEW" ||
    isLegacyShortlistedSelected(
      application.status,
      application.interviewStatus,
    )
  );
}

/** @deprecated Prefer canManageAssignment */
export function canAssignInterview(application: {
  status: JobApplicationStatus;
  interviewAssignment?: { id: string } | null;
  interviewStatus?: JobApplicationInterviewStatus | string | null;
}): boolean {
  return canManageAssignment(application);
}

export function canRejectApplication(status: JobApplicationStatus): boolean {
  return (
    status !== "REJECTED" &&
    status !== "PLACED" &&
    (status === "APPLIED" ||
      status === "UNDER_REVIEW" ||
      status === "SHORTLISTED" ||
      status === "SELECTED" ||
      status === "ASSESSMENT" ||
      status === "INTERVIEW")
  );
}

/** @deprecated Use canApproveApplication */
export function canAcceptApplication(status: JobApplicationStatus): boolean {
  return canApproveApplication(status);
}
