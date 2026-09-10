export interface StudentAssessmentRecord {
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

export interface StudentAssessmentOverview {
  studentId: string;
  records: StudentAssessmentRecord[];
  assessmentTypes: string[];
  countsByType: Record<string, number>;
  totalAssessments: number;
  overallPerformance: number;
  summary: {
    totalAssessments: number;
    marksEntered: number;
    averageMarks: number;
    averagePercentage: number;
    highestMarks: number;
    lowestMarks: number;
  };
}

export interface StudentAssessmentResponse {
  success: boolean;
  message: string;
  data: StudentAssessmentOverview;
}
