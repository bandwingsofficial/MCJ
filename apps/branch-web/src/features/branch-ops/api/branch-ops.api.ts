import { apiClient } from "@/src/core/api/axios";
import type {
  ApiSuccess,
  AssessmentItem,
  AttendanceItem,
  BatchCourseContent,
  BatchListItem,
  BatchStudentItem,
  BranchUserItem,
  DashboardData,
  EnrollmentItem,
  InterviewItem,
  JobApplicationItem,
  PaginatedList,
  PlacementActivityItem,
  StudentBatchActivity,
  StudentListItem,
} from "@/src/features/branch-ops/types";

const unwrap = <T>(promise: Promise<{ data: ApiSuccess<T> }>) =>
  promise.then((response) => response.data.data);

export const branchOpsApi = {
  dashboard: () =>
    unwrap<DashboardData>(apiClient.get("/branch/dashboard")),

  batches: () => unwrap<BatchListItem[]>(apiClient.get("/branch/batches")),

  batch: (id: string) =>
    unwrap<BatchListItem>(apiClient.get(`/branch/batches/${id}`)),

  batchCourse: (id: string) =>
    unwrap<BatchCourseContent>(apiClient.get(`/branch/batches/${id}/course`)),

  batchStudents: (id: string) =>
    unwrap<BatchStudentItem[]>(apiClient.get(`/branch/batches/${id}/students`)),

  studentBatchActivity: (batchId: string, studentId: string) =>
    unwrap<StudentBatchActivity>(
      apiClient.get(`/branch/batches/${batchId}/students/${studentId}/activity`),
    ),

  students: () =>
    unwrap<StudentListItem[]>(apiClient.get("/branch/students")),

  attendance: (params?: Record<string, string | undefined>) =>
    unwrap<AttendanceItem[]>(
      apiClient.get("/branch/attendance", { params }),
    ),

  attendanceReport: (params?: Record<string, string | undefined>) =>
    unwrap<{
      totals: {
        present: number;
        absent: number;
        late: number;
        leave: number;
      };
      items: AttendanceItem[];
    }>(apiClient.get("/branch/attendance/report", { params })),

  saveAttendance: (payload: {
    batchId: string;
    studentId: string;
    date: string;
    status: string;
    remarks?: string;
  }) => unwrap(apiClient.post("/branch/attendance", payload)),

  punch: (payload: {
    batchId: string;
    studentId: string;
    type: "IN" | "OUT";
    date?: string;
  }) => unwrap(apiClient.post("/branch/attendance/punch", payload)),

  assessments: (params?: Record<string, string | undefined>) =>
    unwrap<AssessmentItem[]>(
      apiClient.get("/branch/assessments", { params }),
    ),

  createAssessment: (payload: {
    batchId: string;
    studentId: string;
    type: string;
    name: string;
    date: string;
    maxMarks: number;
    obtainedMarks: number;
    remarks?: string;
  }) => unwrap<AssessmentItem>(apiClient.post("/branch/assessments", payload)),

  jobApplications: (params?: Record<string, string | undefined>) =>
    unwrap<{ items: JobApplicationItem[]; total: number }>(
      apiClient.get("/branch/job-applications", { params }),
    ),

  jobApplication: (id: string) =>
    unwrap<Record<string, unknown>>(
      apiClient.get(`/branch/job-applications/${id}`),
    ),

  updateApplicationStatus: (id: string, status: string) =>
    unwrap(
      apiClient.patch(`/branch/job-applications/${id}/status`, { status }),
    ),

  interviews: (params?: Record<string, string | undefined>) =>
    unwrap<InterviewItem[]>(apiClient.get("/branch/interviews", { params })),

  scheduleInterview: (payload: {
    applicationId: string;
    scheduledAt: string;
    mode: string;
    durationMinutes?: number;
    locationOrLink?: string;
    notes?: string;
  }) => unwrap<InterviewItem>(apiClient.post("/branch/interviews", payload)),

  updateInterview: (
    id: string,
    payload: {
      notes?: string;
      evaluation?: string;
      status?: string;
      decision?: string;
    },
  ) => unwrap<InterviewItem>(apiClient.patch(`/branch/interviews/${id}`, payload)),

  placementActivity: () =>
    unwrap<PlacementActivityItem[]>(
      apiClient.get("/branch/placement-activity"),
    ),

  users: (params?: Record<string, string | number | undefined>) =>
    unwrap<PaginatedList<BranchUserItem>>(
      apiClient.get("/branch/users", { params }),
    ),

  createUser: (payload: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: "FACULTY" | "INTERVIEWER";
    confirmRestore?: boolean;
  }) =>
    unwrap<{ id: string; restored?: boolean }>(
      apiClient.post("/branch/users", payload),
    ),

  updateUser: (
    id: string,
    payload: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      role?: "FACULTY" | "INTERVIEWER";
    },
  ) => unwrap(apiClient.patch(`/branch/users/${id}`, payload)),

  resetPassword: (id: string, newPassword: string) =>
    unwrap(
      apiClient.patch(`/branch/users/${id}/reset-password`, { newPassword }),
    ),

  activateUser: (id: string) =>
    unwrap(apiClient.patch(`/branch/users/${id}/activate`)),

  deactivateUser: (id: string) =>
    unwrap(apiClient.patch(`/branch/users/${id}/deactivate`)),

  deleteUser: (id: string) => unwrap(apiClient.delete(`/branch/users/${id}`)),

  assignFaculty: (batchId: string, facultyId: string) =>
    unwrap(
      apiClient.post(`/branch/batches/${batchId}/faculty`, { facultyId }),
    ),

  enrollments: (params?: Record<string, string | number | undefined>) =>
    unwrap<PaginatedList<EnrollmentItem>>(
      apiClient.get("/branch/enrollments", { params }),
    ),
};
