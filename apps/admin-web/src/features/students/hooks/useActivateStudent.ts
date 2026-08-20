"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";

interface UseActivateStudentReturn {
  isLoading: boolean;
  activateStudent: (id: string) => Promise<void>;
}

export const useActivateStudent = (): UseActivateStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const activateStudent = async (id: string) => {
    try {
      setIsLoading(true);
      await studentService.activateStudent(id);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activateStudent,
    isLoading,
  };
};
