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
    image?: File | null,
  ) => Promise<void>;
}

export const useUpdateStudent = (): UseUpdateStudentReturn => {
  const [isLoading, setIsLoading] = useState(false);

  const updateStudent = async (
    id: string,
    payload: UpdateStudentRequest,
    image?: File | null,
  ) => {
    try {
      setIsLoading(true);

      const requestPayload: UpdateStudentRequest = { ...payload };

      if (image) {
        const uploadResponse = await studentService.uploadStudentImage(image);
        requestPayload.profileImageFileId = uploadResponse.data.fileId;
      }

      await studentService.updateStudent(id, requestPayload);
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
