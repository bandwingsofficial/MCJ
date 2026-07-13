"use client";

import {
  useState,
} from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { studentService } from "@/src/features/students/services/student.service";

import type {
  CreateStudentRequest,
} from "@/src/features/students/types/student.types";

interface UseCreateStudentReturn {
  isLoading: boolean;

  createStudent: (
    payload: CreateStudentRequest,
    image?: File | null
  ) => Promise<boolean>;
}

export const useCreateStudent =
  (
    onSuccess?: () => void
  ): UseCreateStudentReturn => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const createStudent =
      async (
        payload: CreateStudentRequest,
        image?: File | null
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const requestPayload: CreateStudentRequest =
            {
              ...payload,
            };

          if (image) {
            const uploadResponse =
              await studentService.uploadStudentImage(
                image
              );

            requestPayload.profileImageFileId =
              uploadResponse.data.fileId;
          }

          const response =
            await studentService.createStudent(
              requestPayload
            );

          appToast.success(
            response.message
          );

          onSuccess?.();

          return true;
        } catch (error) {
          appToast.error(
            error instanceof Error
              ? error.message
              : "Failed to create student"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      createStudent,
    };
  };