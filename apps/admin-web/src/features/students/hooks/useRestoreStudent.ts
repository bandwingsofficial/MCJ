"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";

interface UseRestoreStudentReturn {
  isLoading: boolean;
  isPending: boolean;
  restoreStudent: (id: string) => Promise<void>;
}

export const useRestoreStudent = (): UseRestoreStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const restoreStudent = async (id: string) => {
    try {
      setIsLoading(true);
      await studentService.restoreStudent(id);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    restoreStudent,
    isLoading,
    isPending: isLoading,
  };
};
