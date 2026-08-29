"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader } from "@/src/shared/components/ui/loader";

interface PageProps {
  params: Promise<{ batchId: string; studentId: string }>;
  searchParams: Promise<{ recordId?: string }>;
}

/** Legacy manage route → details page (Manage is now a modal). */
export default function AttendanceManageRoutePage({
  params,
  searchParams,
}: PageProps) {
  const router = useRouter();
  const { batchId, studentId } = use(params);
  const query = use(searchParams);

  useEffect(() => {
    const qs = query.recordId
      ? `?recordId=${encodeURIComponent(query.recordId)}`
      : "";
    router.replace(`/attendance/details/${batchId}/${studentId}${qs}`);
  }, [router, batchId, studentId, query.recordId]);

  return <Loader />;
}
