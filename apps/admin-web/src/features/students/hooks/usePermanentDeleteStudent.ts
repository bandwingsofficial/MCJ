"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";

interface UsePermanentDeleteStudentReturn {
  isLoading: boolean;
  isPending: boolean;
  permanentDeleteStudent: (id: string) => Promise<void>;
}

export const usePermanentDeleteStudent = (): UsePermanentDeleteStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const permanentDeleteStudent = async (id: string) => {
    try {
      setIsLoading(true);
      await studentService.permanentDeleteStudent(id);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permanentDeleteStudent,
    isLoading,
    isPending: isLoading,
  };
};
