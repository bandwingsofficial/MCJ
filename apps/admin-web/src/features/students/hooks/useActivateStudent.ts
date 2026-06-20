"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { appToast } from "@/src/shared/components/ui/toast";

import { studentApi } from "@/src/features/students/api/student.api";
import { studentService } from "@/src/features/students/services/student.service";

export const useActivateStudent = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      studentService.activateStudent(id),

    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({
        queryKey: studentApi.lists(),
      });

      void queryClient.invalidateQueries({
        queryKey: studentApi.detail(id),
      });

      appToast.success(
        "Student activated successfully."
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