"use client";

import { useEffect, useMemo, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, Plus } from "lucide-react";
import { useForm } from "react-hook-form";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";
import {
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { courseQuizSchema } from "@/src/features/course-quizzes/schemas/course-quiz.schema";
import {
  useCreateQuizQuestion,
  useDeleteQuizQuestion,
  usePublishCourseQuiz,
  useReorderQuizQuestions,
  useUpdateCourseQuiz,
  useUpdateQuizQuestion,
} from "@/src/features/course-quizzes/hooks";

import type {
  CourseQuizDetail,
  CourseQuizFormValues,
  CourseQuizQuestion,
  QuizQuestionFormValues,
} from "@/src/features/course-quizzes/types/course-quiz.types";

import { QuizQuestionForm } from "./quiz-question-form";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";

function mapQuizToFormValues(quiz: CourseQuizDetail): CourseQuizFormValues {
  return {
    title: quiz.title,
    description: quiz.description ?? "",
    passingScore:
      quiz.passingScore !== null ? String(quiz.passingScore) : "",
    timeLimitMinutes:
      quiz.timeLimitMinutes !== null ? String(quiz.timeLimitMinutes) : "",
  };
}

function mapQuestionFormToPayload(values: QuizQuestionFormValues) {
  return {
    questionText: values.questionText,
    type: values.type,
    explanation: values.explanation || undefined,
    points: Number(values.points),
    options: values.options.map((option, index) => ({
      optionText: option.optionText,
      isCorrect: option.isCorrect,
      displayOrder: index,
    })),
  };
}

function getQuestionTypeLabel(type: CourseQuizQuestion["type"]) {
  switch (type) {
    case "TRUE_FALSE":
      return "True / False";
    case "MULTIPLE_SELECT":
      return "Multiple Select";
    default:
      return "Multiple Choice";
  }
}

interface QuizBuilderProps {
  quiz: CourseQuizDetail;
  onQuizUpdated: () => Promise<void>;
}

export function QuizBuilder({ quiz, onQuizUpdated }: QuizBuilderProps) {
  const { updateCourseQuiz, isLoading: isUpdatingQuiz } = useUpdateCourseQuiz();
  const { publishCourseQuiz, isLoading: isPublishing } = usePublishCourseQuiz();
  const { createQuizQuestion, isLoading: isCreatingQuestion } =
    useCreateQuizQuestion();
  const { updateQuizQuestion, isLoading: isUpdatingQuestion } =
    useUpdateQuizQuestion();
  const { deleteQuizQuestion, isLoading: isDeletingQuestion } =
    useDeleteQuizQuestion();
  const { reorderQuizQuestions, isLoading: isReordering } =
    useReorderQuizQuestions();

  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] =
    useState<CourseQuizQuestion | null>(null);
  const [deleteQuestionOpen, setDeleteQuestionOpen] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [dragQuestionId, setDragQuestionId] = useState<string | null>(null);

  const sortedQuestions = useMemo(
    () =>
      [...quiz.questions].sort((a, b) => a.displayOrder - b.displayOrder),
    [quiz.questions],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CourseQuizFormValues>({
    resolver: zodResolver(courseQuizSchema),
    defaultValues: mapQuizToFormValues(quiz),
  });

  useEffect(() => {
    reset(mapQuizToFormValues(quiz));
  }, [quiz, reset]);

  const getFieldState = (fieldError?: { message?: string }) =>
    fieldError ? "invalid" : "neutral";

  const handleSaveSettings = handleSubmit(async (values) => {
    try {
      await updateCourseQuiz(quiz.id, {
        title: values.title,
        description: values.description || null,
        passingScore:
          values.passingScore.trim() === ""
            ? null
            : Number(values.passingScore),
        timeLimitMinutes:
          values.timeLimitMinutes.trim() === ""
            ? null
            : Number(values.timeLimitMinutes),
      });
      appToast.success("Quiz settings saved");
      await onQuizUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  });

  const handlePublish = async () => {
    setPublishError(null);

    try {
      await publishCourseQuiz(quiz.id);
      appToast.success("Quiz published");
      await onQuizUpdated();
    } catch (error) {
      const message = getErrorMessage(error);
      setPublishError(message);
      appToast.error(message);
    }
  };

  const handleQuestionSubmit = async (values: QuizQuestionFormValues) => {
    try {
      if (selectedQuestion) {
        await updateQuizQuestion(
          selectedQuestion.id,
          mapQuestionFormToPayload(values),
        );
        appToast.success("Question updated");
      } else {
        await createQuizQuestion(quiz.id, mapQuestionFormToPayload(values));
        appToast.success("Question added");
      }

      setQuestionFormOpen(false);
      setSelectedQuestion(null);
      await onQuizUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) {
      return;
    }

    try {
      await deleteQuizQuestion(selectedQuestion.id);
      appToast.success("Question deleted");
      setDeleteQuestionOpen(false);
      setSelectedQuestion(null);
      await onQuizUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  const handleQuestionDrop = async (targetQuestionId: string) => {
    if (!dragQuestionId || dragQuestionId === targetQuestionId || isReordering) {
      setDragQuestionId(null);
      return;
    }

    const ids = sortedQuestions.map((question) => question.id);
    const fromIndex = ids.indexOf(dragQuestionId);
    const toIndex = ids.indexOf(targetQuestionId);

    if (fromIndex < 0 || toIndex < 0) {
      setDragQuestionId(null);
      return;
    }

    const reordered = [...ids];
    reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, dragQuestionId);

    try {
      await reorderQuizQuestions(quiz.id, reordered);
      appToast.success("Questions reordered");
      await onQuizUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setDragQuestionId(null);
    }
  };

  const statusBadge =
    quiz.status === "PUBLISHED"
      ? <Badge variant="success">Published</Badge>
      : <Badge variant="warning">Draft</Badge>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {statusBadge}
          <span className="text-sm text-slate-500">
            {sortedQuestions.length} question
            {sortedQuestions.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {quiz.status === "DRAFT" ? (
            <Button
              type="button"
              onClick={() => {
                void handlePublish();
              }}
              disabled={isPublishing}
            >
              Publish Quiz
            </Button>
          ) : null}
        </div>
      </div>

      {publishError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {publishError}
        </div>
      ) : null}

      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-900">Quiz Settings</h2>

        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSaveSettings();
          }}
        >
          <ValidatedField
            label="Quiz Title"
            required
            state={getFieldState(errors.title)}
            errorMessage={errors.title?.message}
          >
            <Input
              {...register("title")}
              placeholder="Enter quiz title"
              className={validatedFieldInputClass(
                getFieldState(errors.title),
              )}
            />
          </ValidatedField>

          <ValidatedField
            label="Description"
            state={getFieldState(errors.description)}
            errorMessage={errors.description?.message}
          >
            <Textarea
              {...register("description")}
              rows={3}
              placeholder="Optional quiz description"
              className={validatedFieldInputClass(
                getFieldState(errors.description),
              )}
            />
          </ValidatedField>

          <div className="grid gap-4 sm:grid-cols-2">
            <ValidatedField
              label="Passing Score (%)"
              state={getFieldState(errors.passingScore)}
              errorMessage={errors.passingScore?.message}
            >
              <Input
                {...register("passingScore")}
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 70"
                className={validatedFieldInputClass(
                  getFieldState(errors.passingScore),
                )}
              />
            </ValidatedField>

            <ValidatedField
              label="Time Limit (minutes)"
              state={getFieldState(errors.timeLimitMinutes)}
              errorMessage={errors.timeLimitMinutes?.message}
            >
              <Input
                {...register("timeLimitMinutes")}
                type="number"
                min={1}
                placeholder="Optional"
                className={validatedFieldInputClass(
                  getFieldState(errors.timeLimitMinutes),
                )}
              />
            </ValidatedField>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="outline"
              disabled={isUpdatingQuiz || isSubmitting}
            >
              Save Settings
            </Button>
          </div>
        </form>
      </Card>

      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Questions</h2>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              setSelectedQuestion(null);
              setQuestionFormOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Question
          </Button>
        </div>

        {sortedQuestions.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No questions yet. Add a question to build this quiz.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {sortedQuestions.map((question, index) => {
              const sortedOptions = [...question.options].sort(
                (a, b) => a.displayOrder - b.displayOrder,
              );

              return (
                <li
                  key={question.id}
                  draggable={!isReordering}
                  onDragStart={() => {
                    if (!isReordering) {
                      setDragQuestionId(question.id);
                    }
                  }}
                  onDragOver={(event) => {
                    if (dragQuestionId) {
                      event.preventDefault();
                    }
                  }}
                  onDrop={() => {
                    void handleQuestionDrop(question.id);
                  }}
                  onDragEnd={() => setDragQuestionId(null)}
                  className={`rounded-xl border border-slate-200 bg-slate-50/60 p-4 ${
                    dragQuestionId === question.id ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <GripVertical
                      className="mt-1 h-4 w-4 shrink-0 text-slate-400"
                      aria-hidden
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold tabular-nums text-slate-500">
                          {formatContentOrderNumber(index + 1)}
                        </span>
                        <Badge variant="info">
                          {getQuestionTypeLabel(question.type)}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {question.points} pt
                          {question.points === 1 ? "" : "s"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-900">
                        {question.questionText}
                      </p>

                      <ul className="mt-3 space-y-1.5">
                        {sortedOptions.map((option) => (
                          <li
                            key={option.id}
                            className={`rounded-md px-3 py-2 text-sm ${
                              option.isCorrect
                                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                                : "border border-slate-200 bg-white text-slate-700"
                            }`}
                          >
                            {option.optionText}
                            {option.isCorrect ? (
                              <span className="ml-2 text-xs font-medium">
                                Correct
                              </span>
                            ) : null}
                          </li>
                        ))}
                      </ul>

                      {question.explanation ? (
                        <p className="mt-3 text-xs text-slate-500">
                          Explanation: {question.explanation}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuestion(question);
                          setQuestionFormOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedQuestion(question);
                          setDeleteQuestionOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <QuizQuestionForm
        open={questionFormOpen}
        loading={isCreatingQuestion || isUpdatingQuestion}
        question={selectedQuestion ?? undefined}
        onClose={() => {
          setQuestionFormOpen(false);
          setSelectedQuestion(null);
        }}
        onSubmit={handleQuestionSubmit}
      />

      <ConfirmDialog
        open={deleteQuestionOpen}
        title="Delete question?"
        description="This question will be removed from the quiz."
        confirmLabel="Delete"
        loading={isDeletingQuestion}
        onCancel={() => {
          setDeleteQuestionOpen(false);
          setSelectedQuestion(null);
        }}
        onConfirm={() => {
          void handleDeleteQuestion();
        }}
      />
    </div>
  );
}
