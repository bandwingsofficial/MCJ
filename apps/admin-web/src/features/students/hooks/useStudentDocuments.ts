"use client";

import { useCallback, useEffect, useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";
import type { StudentDocument } from "@/src/features/students/types/student.types";

interface UseStudentDocumentsOptions {
  studentId: string;
  refreshKey?: number;
}

interface UseStudentDocumentsReturn {
  documents: StudentDocument[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useStudentDocuments({
  studentId,
  refreshKey = 0,
}: UseStudentDocumentsOptions): UseStudentDocumentsReturn {
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await studentService.getStudentDocuments(studentId);
      setDocuments(response.data ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch documents.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    if (!studentId) {
      return;
    }

    void fetchDocuments();
  }, [studentId, refreshKey, fetchDocuments]);

  return {
    documents,
    isLoading,
    error,
    refetch: fetchDocuments,
  };
}
