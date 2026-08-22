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
  createStudent: (
    payload: CreateStudentRequest,
    image?: File | null,
  ) => Promise<Student>;
}

export const useCreateStudent = (): UseCreateStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const createStudent = async (
    payload: CreateStudentRequest,
    image?: File | null,
  ) => {
    try {
      setIsLoading(true);

      const requestPayload: CreateStudentRequest = { ...payload };

      if (image) {
        const uploadResponse = await studentService.uploadStudentImage(image);
        requestPayload.profileImageFileId = uploadResponse.data.fileId;
      }

      const response = await studentService.createStudent(requestPayload);
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
