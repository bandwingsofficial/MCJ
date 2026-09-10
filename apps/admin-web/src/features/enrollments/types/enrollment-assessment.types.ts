export interface EnrollmentAssessmentRecord {
  id: string;
  assessmentGroupId: string | null;
  enrollmentId: string;
  date: string;
  name: string;
  type: string;
  batch: { id: string; name: string; code?: string };
  batchTiming: { id: string; name: string; mode: string } | null;
  course: { id: string; title: string; code: string | null } | null;
  maxMarks: number;
  obtainedMarks: number;
  percentage: number;
  remarks: string | null;
}

export interface EnrollmentAssessmentDetail {
  student: {
    id: string;
    name: string;
    firstName: string;
    lastName: string | null;
    studentCode: string;
    email: string | null;
    phone: string | null;
    status: string;
  };
  enrollmentId: string;
  batch: { id: string; name: string; code: string };
  branch: { id: string; branchName: string; branchCode: string };
  timing: { id: string; name: string; mode: string } | null;
  course: { id: string; title: string; code: string | null };
  overallPerformance: number;
  totalAssessments: number;
  countsByType: Record<string, number>;
  assessmentTypes: string[];
  groupedAssessments: Array<{
    type: string;
    items: Array<{
      id: string;
      name: string;
      date: string;
      type: string;
      maxMarks: number;
      obtainedMarks: number;
      percentage: number;
      remarks: string | null;
    }>;
  }>;
  records: EnrollmentAssessmentRecord[];
  summary: {
    totalAssessments: number;
    marksEntered: number;
    averageMarks: number;
    averagePercentage: number;
    highestMarks: number;
    lowestMarks: number;
  };
}

export interface EnrollmentAssessmentResponse {
  success: boolean;
  message: string;
  data: EnrollmentAssessmentDetail;
}
