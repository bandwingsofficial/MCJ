"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";

interface UseDeleteStudentReturn {
  isLoading: boolean;
  isPending: boolean;
  deleteStudent: (id: string) => Promise<void>;
}

export const useDeleteStudent = (): UseDeleteStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteStudent = async (id: string) => {
    try {
      setIsLoading(true);
      await studentService.deleteStudent(id);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    deleteStudent,
    isLoading,
    isPending: isLoading,
  };
};
