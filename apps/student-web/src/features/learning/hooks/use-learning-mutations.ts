"use client";

import {
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";

import { learningService } from "@/src/features/learning/services/learning.service";
import { learningQueryKeys } from "@/src/features/learning/hooks/use-learning-queries";
import type {
  StudentLessonQuizDto,
  StudentQuizAttemptSummaryDto,
  StudentQuizSubmitResultDto,
} from "@/src/features/learning/types/learning.types";

function buildLatestAttemptFromSubmitResult(
  result: StudentQuizSubmitResultDto,
): StudentQuizAttemptSummaryDto {
  return {
    id: result.attemptId,
    score: result.score,
    totalPoints: result.totalPoints,
    percentage: result.percentage,
    passed: result.passed,
    createdAt: new Date().toISOString(),
  };
}

function applyQuizAttemptToCache(
  queryClient: QueryClient,
  courseId: string,
  lessonId: string,
  result: StudentQuizSubmitResultDto,
) {
  const latestAttempt = buildLatestAttemptFromSubmitResult(result);

  queryClient.setQueryData<StudentLessonQuizDto>(
    learningQueryKeys.quiz(courseId, lessonId),
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        latestAttempt,
      };
    },
  );
}

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
    onSuccess: async (result) => {
      applyQuizAttemptToCache(queryClient, courseId, lessonId, result);

      await Promise.all([
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

      void queryClient.invalidateQueries({
        queryKey: learningQueryKeys.quiz(courseId, lessonId),
      });
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
