"use client";

import { useCallback, useEffect, useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";
import type { Student } from "@/src/features/students/types/student.types";
import type { StudentAssessmentOverview } from "@/src/features/students/types/student-assessment.types";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { StudentAssessmentRecordsView } from "./student-assessment-records-view";

interface Props {
  student: Student;
  refreshKey?: number;
}

export function StudentManageAssessmentsPanel({
  student,
  refreshKey = 0,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<StudentAssessmentOverview | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await studentService.getStudentAssessments(student.id);
      setData(result);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load student assessment records.",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  if (loading && !data) return <Loader />;
  if (error && !data) {
    return <ErrorState description={error} onRetry={load} />;
  }
  if (!data) {
    return (
      <ErrorState description="Assessment records are not available for this student." />
    );
  }

  return <StudentAssessmentRecordsView data={data} />;
}
