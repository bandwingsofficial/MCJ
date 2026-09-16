"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { learningService } from "@/src/features/learning/services/learning.service";
import { learningQueryKeys } from "@/src/features/learning/hooks/use-learning-queries";

export function useMarkLessonComplete(courseId: string, lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => learningService.markLessonComplete(courseId, lessonId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.course(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.lesson(courseId, lessonId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.progress(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.completion(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.dashboard,
        }),
      ]);
    },
  });
}

export function useUpdateWatchedSeconds(courseId: string, lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (watchedSeconds: number) =>
      learningService.updateWatchedSeconds(
        courseId,
        lessonId,
        watchedSeconds,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: learningQueryKeys.lesson(courseId, lessonId),
      });
    },
  });
}

export function useSubmitLessonQuiz(courseId: string, lessonId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      answers: Array<{
        questionId: string;
        selectedOptionIds: string[];
      }>,
    ) => learningService.submitLessonQuiz(courseId, lessonId, answers),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.quiz(courseId, lessonId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.lesson(courseId, lessonId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.course(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.progress(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.completion(courseId),
        }),
        queryClient.invalidateQueries({
          queryKey: learningQueryKeys.dashboard,
        }),
      ]);
    },
  });
}

export function useValidateLessonQuizAnswer(courseId: string, lessonId: string) {
  return useMutation({
    mutationFn: (payload: {
      questionId: string;
      selectedOptionIds: string[];
    }) => learningService.validateLessonQuizAnswer(courseId, lessonId, payload),
  });
}
