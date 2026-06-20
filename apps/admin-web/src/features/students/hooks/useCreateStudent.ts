"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { appToast } from "@/src/shared/components/ui/toast";

import { studentApi } from "@/src/features/students/api/student.api";

import { studentService } from "@/src/features/students/services/student.service";

export const useCreateStudent = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn:
      studentService.createStudent,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          studentApi.lists(),
      });

      appToast.success(
        "Student created successfully."
      );
    },

    onError: (
      error: Error
    ) => {
      appToast.error(
        error.message
      );
    },
  });
};