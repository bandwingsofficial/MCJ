"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";
import type { UpdateStudentRequest } from "@/src/features/students/types/student.types";

interface UseUpdateStudentReturn {
  isLoading: boolean;
  isPending: boolean;
  updateStudent: (
    id: string,
    payload: UpdateStudentRequest,
  ) => Promise<void>;
}

export const useUpdateStudent = (): UseUpdateStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const updateStudent = async (
    id: string,
    payload: UpdateStudentRequest,
  ) => {
    try {
      setIsLoading(true);
      await studentService.updateStudent(id, payload);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isPending: isLoading,
    updateStudent,
  };
};
