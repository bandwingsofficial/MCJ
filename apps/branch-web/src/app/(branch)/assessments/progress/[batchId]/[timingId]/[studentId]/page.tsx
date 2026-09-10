"use client";

import { use } from "react";

import { StudentAssessmentDetailPage } from "@/src/features/branch-ops/components/assessment/student-assessment-detail-page";

interface PageProps {
  params: Promise<{
    batchId: string;
    timingId: string;
    studentId: string;
  }>;
}

export default function StudentAssessmentDetailRoutePage({ params }: PageProps) {
  const { batchId, timingId, studentId } = use(params);

  return (
    <StudentAssessmentDetailPage
      batchId={batchId}
      timingId={timingId}
      studentId={studentId}
    />
  );
}
