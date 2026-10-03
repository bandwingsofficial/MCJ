"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

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
      const response = await studentService.updateStudentAdmissionStatus(id, {
        status,
      });
      appToast.success(response.message ?? "Student status updated.");
      return response;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateStudentAdmissionStatus,
    isLoading,
  };
}
