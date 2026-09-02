"use client";

import { use } from "react";

import { StudentDetailsPage } from "@/src/features/branch-ops/components/students/student-details-page";

interface StudentDetailsRoutePageProps {
  params: Promise<{
    studentId: string;
  }>;
}

export default function StudentDetailsRoutePage({
  params,
}: StudentDetailsRoutePageProps) {
  const { studentId } = use(params);

  return <StudentDetailsPage studentId={studentId} />;
}
