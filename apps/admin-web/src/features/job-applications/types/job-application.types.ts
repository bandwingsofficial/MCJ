export type JobApplicationStatus =
  | "APPLIED"
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
  status: JobApplicationStatus;
  interviewStatus: JobApplicationInterviewStatus;
  isDeleted: boolean;
  deletedAt: string | null;
  job: JobSummary;
  user: JobApplicationUser | null;
  student: JobApplicationStudent | null;
  resolvedStudentCode?: string | null;
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
  return (
    application.student?.email ||
    application.user?.email ||
    application.applicantEmail ||
    "—"
  );
}

export function getStudentCode(application: JobApplication): string {
  return (
    application.student?.studentCode ??
    application.resolvedStudentCode ??
    "—"
  );
}

export function getApplicantPhone(application: JobApplication): string {
  return (
    application.student?.phone ||
    application.user?.phone ||
    application.applicantPhone ||
    "—"
  );
}

export type OnboardingStatusFilter = "PENDING" | "ACCEPTED" | "REJECTED";

export function toJobApplicationStatus(
  filter: OnboardingStatusFilter,
): JobApplicationStatus | undefined {
  if (filter === "PENDING") {
    return "APPLIED";
  }

  if (filter === "ACCEPTED") {
    return "SELECTED";
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
    NOT_YET: "Not Yet",
    INTERVIEW_SCHEDULED: "Interview Scheduled",
    INTERVIEWED: "Interviewed",
    SELECTED: "Selected",
    REJECTED: "Rejected",
    PLACED: "Placed",
  };

  return labels[status];
}

export function getOnboardingStatusLabel(status: JobApplicationStatus): string {
  if (status === "APPLIED") {
    return "Pending";
  }

  if (status === "REJECTED") {
    return "Rejected";
  }

  if (status === "SELECTED" || status === "PLACED") {
    return "Approved";
  }

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function canApproveApplication(status: JobApplicationStatus): boolean {
  return status === "APPLIED" || status === "REJECTED";
}

export function canRejectApplication(status: JobApplicationStatus): boolean {
  return (
    status !== "REJECTED" &&
    status !== "PLACED" &&
    (status === "APPLIED" ||
      status === "SELECTED" ||
      status === "SHORTLISTED" ||
      status === "ASSESSMENT" ||
      status === "INTERVIEW")
  );
}

/** @deprecated Use canApproveApplication */
export function canAcceptApplication(status: JobApplicationStatus): boolean {
  return canApproveApplication(status);
}
