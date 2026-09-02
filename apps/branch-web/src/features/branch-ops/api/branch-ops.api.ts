import { apiClient } from "@/src/core/api/axios";
import type {
  ApiSuccess,
  AssessmentGroupDetail,
  AssessmentItem,
  AssessmentReport,
  AssessmentSheet,
  AttendanceItem,
  AttendanceReport,
  AttendanceSessionOption,
  AttendanceSheet,
  AttendanceSummary,
  BatchAssessmentAnalytics,
  BatchAttendanceAnalytics,
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
  StudentBatchAttendanceDetail,
  StudentDetail,
  StudentFeesData,
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

  student: (id: string) =>
    unwrap<StudentDetail>(apiClient.get(`/branch/students/${id}`)),

  studentFees: (
    studentId: string,
    params?: Record<string, string | number | undefined>,
  ) =>
    unwrap<StudentFeesData>(
      apiClient.get(`/branch/students/${studentId}/fees`, { params }),
    ),

  attendance: (params?: Record<string, string | number | undefined>) =>
    unwrap<{ items: AttendanceItem[]; total: number }>(
      apiClient.get("/branch/attendance", { params }),
    ),

  attendanceReport: (params?: Record<string, string | number | undefined>) =>
    unwrap<AttendanceReport>(
      apiClient.get("/branch/attendance/report", { params }),
    ),

  attendanceSheet: (params: {
    batchId: string;
    batchCourseId: string;
    date: string;
  }) =>
    unwrap<AttendanceSheet>(
      apiClient.get("/branch/attendance/sheet", { params }),
    ),

  batchSessions: (batchId: string) =>
    unwrap<AttendanceSessionOption[]>(
      apiClient.get(`/branch/batches/${batchId}/sessions`),
    ),

  batchAttendanceSummary: (batchId: string) =>
    unwrap<BatchAttendanceAnalytics>(
      apiClient.get(`/branch/batches/${batchId}/attendance/summary`),
    ),

  studentBatchAttendance: (
    batchId: string,
    studentId: string,
    params?: Record<string, string | undefined>,
  ) =>
    unwrap<StudentBatchAttendanceDetail>(
      apiClient.get(
        `/branch/batches/${batchId}/students/${studentId}/attendance`,
        { params },
      ),
    ),

  saveAttendance: (payload: {
    batchId: string;
    batchCourseId: string;
    studentId: string;
    date: string;
    status: string;
    remarks?: string;
  }) => unwrap(apiClient.post("/branch/attendance", payload)),

  saveAttendanceBulk: (payload: {
    batchId: string;
    batchCourseId: string;
    date: string;
    records: Array<{ studentId: string; status: string; remarks?: string }>;
  }) =>
    unwrap<{
      items: AttendanceItem[];
      summary: AttendanceSummary;
    }>(apiClient.post("/branch/attendance/bulk", payload)),

  punch: (payload: {
    batchId: string;
    batchCourseId: string;
    studentId: string;
    type: "IN" | "OUT";
    date?: string;
  }) => unwrap(apiClient.post("/branch/attendance/punch", payload)),

  assessments: (params?: Record<string, string | number | undefined>) =>
    unwrap<AssessmentItem[]>(
      apiClient.get("/branch/assessments", { params }),
    ),

  assessmentReport: (params?: Record<string, string | number | undefined>) =>
    unwrap<AssessmentReport>(
      apiClient.get("/branch/assessments/report", { params }),
    ),

  assessmentSheet: (params: { batchId: string; batchCourseId: string }) =>
    unwrap<AssessmentSheet>(
      apiClient.get("/branch/assessments/sheet", { params }),
    ),

  assessmentGroup: (groupId: string) =>
    unwrap<AssessmentGroupDetail>(
      apiClient.get(`/branch/assessments/groups/${groupId}`),
    ),

  batchAssessmentSummary: (batchId: string) =>
    unwrap<BatchAssessmentAnalytics>(
      apiClient.get(`/branch/batches/${batchId}/assessments/summary`),
    ),

  createAssessment: (payload: {
    batchId: string;
    batchCourseId?: string;
    studentId: string;
    type: string;
    name: string;
    date: string;
    maxMarks: number;
    obtainedMarks: number;
    remarks?: string;
  }) => unwrap<AssessmentItem>(apiClient.post("/branch/assessments", payload)),

  createAssessmentBulk: (payload: {
    batchId: string;
    batchCourseId: string;
    type: string;
    name: string;
    date: string;
    maxMarks: number;
    records: Array<{
      studentId: string;
      obtainedMarks: number;
      remarks?: string;
    }>;
  }) =>
    unwrap<AssessmentGroupDetail>(
      apiClient.post("/branch/assessments/bulk", payload),
    ),

  updateAssessment: (
    id: string,
    payload: {
      name?: string;
      date?: string;
      maxMarks?: number;
      obtainedMarks?: number;
      remarks?: string;
      type?: string;
    },
  ) =>
    unwrap<AssessmentItem>(apiClient.patch(`/branch/assessments/${id}`, payload)),

  updateAssessmentGroup: (
    groupId: string,
    payload: {
      name?: string;
      maxMarks?: number;
      records?: Array<{
        studentId: string;
        obtainedMarks: number;
        remarks?: string;
      }>;
    },
  ) =>
    unwrap<AssessmentGroupDetail>(
      apiClient.patch(`/branch/assessments/groups/${groupId}`, payload),
    ),

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
