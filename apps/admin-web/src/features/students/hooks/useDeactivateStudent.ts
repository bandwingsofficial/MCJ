"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";

interface UseDeactivateStudentReturn {
  isLoading: boolean;
  deactivateStudent: (id: string) => Promise<void>;
}

export const useDeactivateStudent = (): UseDeactivateStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const deactivateStudent = async (id: string) => {
    try {
      setIsLoading(true);
      await studentService.deactivateStudent(id);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deactivateStudent,
    isLoading,
  };
};
