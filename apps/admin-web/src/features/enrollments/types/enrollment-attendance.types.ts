import type { BatchCalendarDayType } from "@/src/features/batches/types/batch.types";

export interface EnrollmentAttendanceSessionOption {
  batchCourseId: string;
  sessionId: string | null;
  sessionNumber: number | null;
  sessionCode: string | null;
  label: string;
  course: {
    id: string;
    title: string;
    code: string | null;
  };
}

export interface EnrollmentAttendanceDetail {
  student: {
    id: string;
    name: string;
    firstName: string;
    lastName: string | null;
    studentCode: string;
    status: string;
    email: string | null;
    phone: string | null;
  };
  batch: {
    id: string;
    name: string;
    code: string;
    startDate: string;
    endDate: string | null;
    daysOfWeek: string[];
  };
  branch: { id: string; branchName: string; branchCode: string };
  enrollmentId: string;
  enrollmentStatus: string;
  batchTiming: {
    id: string;
    name: string;
    mode: string;
  } | null;
  courses: EnrollmentAttendanceSessionOption[];
  summary: {
    calendar: {
      workingDays: number;
      sundays: number;
      holidays: number;
      nonWorkingDays: number;
      totalCalendarDays: number;
    };
    attendance: {
      totalSessions: number;
      attended: number;
      present: number;
      absent: number;
      late: number;
      percentage: number | null;
      ratioLabel: string | null;
    };
  };
  monthly: Array<{
    monthKey: string;
    label: string;
    present: number;
    absent: number;
    late: number;
    leave: number;
    conductedSessions: number;
    attended: number;
    percentage: number | null;
    ratioLabel: string | null;
    hasAttendance: boolean;
  }>;
  history: Array<{
    id: string;
    date: string;
    status: string;
    remarks: string | null;
    createdAt?: string;
    updatedAt?: string;
    markedAt?: string | null;
    batchTiming: {
      id: string;
      name: string;
      mode: string;
    } | null;
    course: { id: string; title: string; code: string | null };
    session: {
      batchCourseId: string;
      sessionId: string | null;
      sessionNumber: number | null;
      label: string;
    };
    faculty: { id: string; name: string } | null;
  }>;
}

export interface EnrollmentAttendanceResponse {
  success: boolean;
  message: string;
  data: EnrollmentAttendanceDetail;
}

export type { BatchCalendarDayType };
