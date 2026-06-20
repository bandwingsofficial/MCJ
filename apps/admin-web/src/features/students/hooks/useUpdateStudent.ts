"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { appToast } from "@/src/shared/components/ui/toast";

import { studentApi } from "@/src/features/students/api/student.api";

import { studentService } from "@/src/features/students/services/student.service";

import {
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";

interface UpdateStudentPayload {
  id: string;

  payload: UpdateStudentRequest;
}

export const useUpdateStudent = () => {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: UpdateStudentPayload) =>
      studentService.updateStudent(
        id,
        payload
      ),

    onSuccess: (
      response,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          studentApi.lists(),
      });

      queryClient.invalidateQueries({
        queryKey:
          studentApi.detail(
            variables.id
          ),
      });

      appToast.success(
        "Student updated successfully."
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