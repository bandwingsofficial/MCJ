"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { appToast } from "@/src/shared/components/ui/toast";

import { studentApi } from "@/src/features/students/api/student.api";
import { studentService } from "@/src/features/students/services/student.service";

export const usePermanentDeleteStudent =
  () => {
    const queryClient =
      useQueryClient();

    return useMutation({
      mutationFn: (
        id: string
      ) =>
        studentService.permanentDeleteStudent(
          id
        ),

      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey:
            studentApi.lists(),
        });

        appToast.success(
          "Student permanently deleted successfully."
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