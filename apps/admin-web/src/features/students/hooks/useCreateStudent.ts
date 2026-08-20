"use client";

import { useState } from "react";

import { studentService } from "@/src/features/students/services/student.service";
import type { CreateStudentRequest } from "@/src/features/students/types/student.types";

interface UseCreateStudentReturn {
  isLoading: boolean;
  isPending: boolean;
  createStudent: (
    payload: CreateStudentRequest,
    image?: File | null,
  ) => Promise<void>;
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

      await studentService.createStudent(requestPayload);
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
