"use client";

import { use } from "react";

import { AttendanceDetailsPage } from "@/src/features/branch-ops/components/attendance/manage-attendance-page";

interface PageProps {
  params: Promise<{ batchId: string; studentId: string }>;
  searchParams: Promise<{ recordId?: string }>;
}

export default function AttendanceDetailsRoutePage({
  params,
  searchParams,
}: PageProps) {
  const { batchId, studentId } = use(params);
  const query = use(searchParams);

  return (
    <AttendanceDetailsPage
      batchId={batchId}
      studentId={studentId}
      recordId={query.recordId ?? null}
    />
  );
}
