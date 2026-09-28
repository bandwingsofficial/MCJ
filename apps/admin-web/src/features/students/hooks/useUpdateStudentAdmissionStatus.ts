"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";
import type { StudentStatus } from "@/src/features/students/types/student.types";

export function useUpdateStudentAdmissionStatus() {
  const [isLoading, setIsLoading] = useState(false);

  const updateStudentAdmissionStatus = async (
    id: string,
    status: StudentStatus,
  ) => {
    setIsLoading(true);

    try {
      return await studentService.updateStudentAdmissionStatus(id, { status });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateStudentAdmissionStatus,
    isLoading,
  };
}
