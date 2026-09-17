"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";
import type {
  CreateStudentRequest,
  Student,
} from "@/src/features/students/types/student.types";

interface UseCreateStudentReturn {
  isLoading: boolean;
  isPending: boolean;
  createStudent: (payload: CreateStudentRequest) => Promise<Student>;
}

export const useCreateStudent = (): UseCreateStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const createStudent = async (payload: CreateStudentRequest) => {
    setIsLoading(true);

    try {
      const response = await studentService.createStudent(payload);
      return response.data;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isPending: isLoading,
    createStudent,
  };
};
