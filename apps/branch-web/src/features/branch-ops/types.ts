export interface ApiSuccess<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardData {
  role: string;
  assignedBatches?: number;
  students?: number;
  todaysAttendance?: number;
  pendingAttendance?: number;
  upcomingTests?: number;
  recentAssessments?: Array<{
    id: string;
    name: string;
    type: string;
    date: string;
    obtainedMarks: number;
    maxMarks: number;
    studentName: string;
    batchName: string;
  }>;
  newApplications?: number;
  pendingInterviews?: number;
  todaysInterviews?: number;
  upcomingInterviews?: number;
  completedInterviews?: number;
  selectedCandidates?: number;
  rejectedCandidates?: number;
  batches?: number;
  placements?: number;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
  leave: number;
  total: number;
  percentage: number;
  unmarked?: number;
}

export interface BatchAttendanceStudentRow {
  id: string;
  enrollmentId: string;
  name: string;
  firstName: string;
  lastName: string | null;
  studentCode: string;
  status: string;
  enrollmentStatus: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
  totalRecords: number;
  attended: number;
  conductedSessions: number;
  ratioLabel: string | null;
  percentage: number | null;
  hasAttendance: boolean;
  lastAttendanceDate: string | null;
  lastAttendanceStatus: string | null;
}

export interface BatchAttendanceAnalytics {
  batch: { id: string; name: string; code: string };
  branch: { id: string; branchName: string; branchCode: string };
  overview: {
    workingDays: number | null;
    sessionsConducted: number;
    enrolledStudents: number;
    totalAttendanceRecords: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    averageAttendance: number | null;
  };
  students: BatchAttendanceStudentRow[];
}

export interface StudentBatchAttendanceDetail {
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
  courses: AttendanceSessionOption[];
  summary: {
    workingDays: number | null;
    attendanceDates: number;
    sessionsConducted: number;
    present: number;
    absent: number;
    late: number;
    leave: number;
    attended: number;
    percentage: number | null;
    ratioLabel: string | null;
    hasAttendance: boolean;
    totalRecords: number;
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

export interface AttendanceSessionOption {
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

export interface AttendanceSheetStudent {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string | null;
  name: string;
  enrollmentId: string;
  attendanceId: string | null;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE" | null;
  remarks: string | null;
}

export interface AttendanceSheet {
  date: string;
  branch: { id: string; branchName: string; branchCode: string };
  batch: { id: string; name: string; code: string };
  session: AttendanceSessionOption;
  students: AttendanceSheetStudent[];
  summary: AttendanceSummary;
  hasExisting: boolean;
}

export interface AttendanceReport {
  totals: AttendanceSummary;
  bySession: Array<{
    batchCourseId: string;
    label: string;
    courseTitle: string;
    present: number;
    absent: number;
    late: number;
    leave: number;
    total: number;
  }>;
  items: AttendanceItem[];
  total: number;
}

export interface BatchListItem {
  id: string;
  name: string;
  code: string;
  mode: string;
  status: string;
  startDate: string;
  endDate: string | null;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
  capacity?: number;
  enrolledStudents: number;
  availableSeats?: number;
  totalWorkingDays?: number | null;
  durationDays?: number | null;
  course: {
    id: string;
    title?: string;
    name?: string;
    code?: string;
    description?: string | null;
    duration?: string | null;
    category?: { id: string; name: string } | null;
  } | null;
  branch?: {
    id: string;
    branchName: string;
    branchCode: string;
    city: string | null;
    state: string | null;
    phone: string | null;
    email: string | null;
    addressLine1: string | null;
  } | null;
  trainers?: Array<{
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string | null;
    phone?: string | null;
    bio?: string | null;
    qualification?: string | null;
    experienceYears?: number | null;
    specialization?: string | null;
    profileImageUrl?: string | null;
  }>;
  faculty: Array<{ id: string; name: string; email: string }>;
  students?: BatchStudentItem[];
}

export interface BatchStudentItem {
  id: string;
  enrollmentId: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone?: string | null;
  studentCode: string;
  status: string;
  enrollmentStatus?: string;
  enrollmentDate?: string | null;
  batch?: { id: string; name: string; code: string } | null;
  branch?: { id: string; branchName: string; branchCode?: string } | null;
  course?: { id: string; title: string } | null;
  attendance?: AttendanceSummary;
}

export interface BatchCourseContent {
  batchId: string;
  courses: Array<{
    id: string;
    title: string;
    code: string;
    description: string | null;
    duration: string | null;
    category?: { id: string; name: string } | null;
    session?: {
      number: number;
      code: string;
    } | null;
  }>;
  trainers: Array<{
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email: string | null;
    phone: string | null;
    bio: string | null;
    qualification: string | null;
    experienceYears: number | null;
    specialization: string | null;
    profileImageUrl: string | null;
  }>;
  modules: Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    name: string;
    description: string | null;
    order: number;
    duration: number | null;
    lessons: Array<{
      id: string;
      name: string;
      description: string | null;
      order: number;
      duration: number | null;
      contentType: string;
      videoUrl: string | null;
      resources: Array<{
        id: string;
        title: string;
        type: string;
        url: string | null;
      }>;
    }>;
  }>;
  materials: Array<{
    id: string;
    courseId: string;
    courseTitle: string;
    title: string;
    type: string;
    url: string | null;
  }>;
}

export interface StudentBatchActivity {
  student: {
    id: string;
    firstName: string;
    lastName: string | null;
    name: string;
    email: string | null;
    phone: string | null;
    studentCode: string;
    status: string;
  };
  batch: { id: string; name: string; code: string };
  enrollmentDate: string | null;
  enrollmentStatus: string;
  attendance: {
    items: Array<{
      id: string;
      date: string;
      status: string;
      punchIn: string | null;
      punchOut: string | null;
      durationMinutes: number | null;
      remarks: string | null;
      course?: { id: string; title: string; code: string | null };
      session?: {
        batchCourseId: string;
        sessionNumber: number | null;
        label: string;
      };
      faculty: { id: string; name: string } | null;
    }>;
    overall: AttendanceSummary;
    weekly: AttendanceSummary;
    monthly: AttendanceSummary;
    yearly: AttendanceSummary;
  };
  assessments: Array<{
    id: string;
    type: string;
    name: string;
    date: string;
    maxMarks: number;
    obtainedMarks: number;
    percentage: number;
    remarks: string | null;
    faculty: { id: string; name: string };
  }>;
}

export interface StudentListItem {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  studentCode: string;
  status: string;
  batchId?: string;
  batchName?: string;
}

export interface StudentDetail {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  studentCode: string;
  status: string;
  branchId: string | null;
  profileImageUrl: string | null;
  admissionDate: string | null;
  branch: {
    id: string;
    branchName: string;
    branchCode: string;
  } | null;
}

export interface AttendanceItem {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "LEAVE";
  punchIn: string | null;
  punchOut: string | null;
  durationMinutes: number | null;
  remarks: string | null;
  createdAt?: string;
  updatedAt?: string;
  markedAt?: string | null;
  student: { id: string; name: string; studentCode: string };
  batch: { id: string; name: string; code?: string };
  branch?: { id: string; branchName: string; branchCode: string };
  course: { id: string; title: string; code: string | null };
  session: {
    batchCourseId: string;
    sessionId: string | null;
    sessionNumber: number | null;
    sessionCode: string | null;
    label: string;
  };
  faculty: { id: string; name: string } | null;
}

export interface AssessmentItem {
  id: string;
  assessmentGroupId: string | null;
  type: string;
  name: string;
  date: string;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  remarks: string | null;
  student: { id: string; name: string; studentCode: string };
  batch: { id: string; name: string; code?: string };
  course: { id: string; title: string; code: string | null } | null;
  session: {
    batchCourseId: string;
    sessionId: string | null;
    sessionNumber: number | null;
    sessionCode: string | null;
    label: string;
  } | null;
  faculty: { id: string; name: string } | null;
}

export interface AssessmentReport {
  items: AssessmentItem[];
  total: number;
}

export interface AssessmentSheetStudent {
  id: string;
  firstName: string;
  lastName: string | null;
  studentCode: string;
  name: string;
}

export interface AssessmentSheet {
  branch: { id: string; branchName: string; branchCode: string };
  batch: { id: string; name: string; code: string };
  session: {
    batchCourseId: string;
    sessionId: string | null;
    sessionNumber: number | null;
    sessionCode: string | null;
    label: string;
    course: { id: string; title: string; code: string | null };
  };
  students: AssessmentSheetStudent[];
  totalStudents: number;
}

export interface AssessmentGroupDetail {
  assessmentGroupId: string;
  type: string;
  name: string;
  date: string;
  maxMarks: number;
  batch: { id: string; name: string; code: string };
  session: AssessmentSheet["session"] | null;
  course: { id: string; title: string; code: string | null } | null;
  faculty: { id: string; name: string } | null;
  marks: Array<{
    id: string;
    student: { id: string; name: string; studentCode: string };
    obtainedMarks: number;
    remarks: string | null;
  }>;
  summary: {
    totalAssessments: number;
    marksEntered: number;
    averageMarks: number;
    averagePercentage: number;
    highestMarks: number;
    lowestMarks: number;
  };
}

export interface BatchAssessmentAnalytics {
  batch: { id: string; name: string; code: string };
  students: Array<{
    student: { id: string; name: string; studentCode: string };
    totalAssessments: number;
    byType: Record<string, number | null>;
    averagePercentage: number | null;
  }>;
}

export interface JobApplicationItem {
  id: string;
  applicationNumber: string;
  applicantName: string | null;
  status: string;
  createdAt: string;
  job: { title: string; companyName: string };
  interviewStatus: string | null;
  interviewScheduledAt: string | null;
}

export interface InterviewItem {
  id: string;
  applicationId: string;
  scheduledAt: string;
  durationMinutes: number;
  mode: string;
  locationOrLink: string | null;
  notes: string | null;
  evaluation: string | null;
  status: string;
  application?: {
    id: string;
    applicationNumber: string;
    candidateName: string | null;
    status: string;
  };
  job?: { id: string; title: string; companyName: string };
  interviewer?: { id: string; name: string; email: string };
}

export interface PlacementActivityItem {
  id: string;
  applicationNumber: string;
  candidateName: string | null;
  jobTitle: string;
  companyName: string;
  status: string;
  interviewStatus: string | null;
  placementStatus: string | null;
  updatedAt: string;
}

export interface BranchUserItem {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  role: string;
  branchId: string;
  branchName?: string;
  isActive: boolean;
}

export interface EnrollmentItem {
  id: string;
  enrollmentNumber: string;
  status: string;
  enrollmentDate: string | null;
  student: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    studentCode: string;
    status: string;
  };
  batch: { id: string; name: string; code?: string } | null;
  course: { id: string; title: string } | null;
}

export interface PaginatedList<T> {
  items: T[];
  count: number;
  skip?: number;
  take?: number;
}

export interface StudentFeeEnrollment {
  id: string;
  enrollmentNumber: string;
  status: string;
  feeAmount: number;
  discountAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: string;
  batch: { id: string; name: string; code: string };
  course: { id: string; title: string };
}

export interface StudentFeeSummary {
  enrollmentId: string;
  enrollmentNumber: string;
  totalCourseFee: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: string;
  batch: { id: string; name: string; code: string };
  course: { id: string; title: string };
}

export interface StudentFeePayment {
  id: string;
  paymentNumber: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  remarks: string | null;
  paidAt: string | null;
  createdAt: string;
}

export interface StudentFeesData {
  enrollments: StudentFeeEnrollment[];
  selectedEnrollmentId: string | null;
  summary: StudentFeeSummary | null;
  payments: {
    items: StudentFeePayment[];
    total: number;
    skip: number;
    take: number;
  };
}
