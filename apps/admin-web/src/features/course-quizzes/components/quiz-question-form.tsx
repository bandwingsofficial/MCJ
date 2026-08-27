"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import {
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";

import { quizQuestionSchema } from "@/src/features/course-quizzes/schemas/course-quiz.schema";

import type {
  CourseQuizQuestion,
  QuizQuestionFormValues,
  QuizQuestionType,
} from "@/src/features/course-quizzes/types/course-quiz.types";

const QUESTION_TYPE_OPTIONS = [
  { label: "Multiple Choice", value: "MULTIPLE_CHOICE" },
  { label: "True / False", value: "TRUE_FALSE" },
  { label: "Multiple Select", value: "MULTIPLE_SELECT" },
];

const DEFAULT_OPTIONS: QuizQuestionFormValues["options"] = [
  { optionText: "", isCorrect: false },
  { optionText: "", isCorrect: false },
];

function getDefaultOptionsForType(type: QuizQuestionType) {
  if (type === "TRUE_FALSE") {
    return [
      { optionText: "True", isCorrect: true },
      { optionText: "False", isCorrect: false },
    ];
  }

  return DEFAULT_OPTIONS.map((option) => ({ ...option }));
}

function mapQuestionToFormValues(
  question: CourseQuizQuestion,
): QuizQuestionFormValues {
  return {
    questionText: question.questionText,
    type: question.type,
    explanation: question.explanation ?? "",
    points: String(question.points),
    options: [...question.options]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((option) => ({
        optionText: option.optionText,
        isCorrect: option.isCorrect,
      })),
  };
}

interface QuizQuestionFormProps {
  open: boolean;
  loading: boolean;
  question?: CourseQuizQuestion;
  onClose: () => void;
  onSubmit: (values: QuizQuestionFormValues) => Promise<void>;
}

export function QuizQuestionForm({
  open,
  loading,
  question,
  onClose,
  onSubmit,
}: QuizQuestionFormProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuizQuestionFormValues>({
    resolver: zodResolver(quizQuestionSchema),
    defaultValues: {
      questionText: "",
      type: "MULTIPLE_CHOICE",
      explanation: "",
      points: "1",
      options: getDefaultOptionsForType("MULTIPLE_CHOICE"),
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "options",
  });

  const questionType = watch("type");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (question) {
      reset(mapQuestionToFormValues(question));
      return;
    }

    reset({
      questionText: "",
      type: "MULTIPLE_CHOICE",
      explanation: "",
      points: "1",
      options: getDefaultOptionsForType("MULTIPLE_CHOICE"),
    });
  }, [open, question, reset]);

  useEffect(() => {
    if (!open || question) {
      return;
    }

    replace(getDefaultOptionsForType(questionType));
  }, [questionType, open, question, replace]);

  const getFieldState = (fieldError?: { message?: string }) =>
    fieldError ? "invalid" : "neutral";

  const handleTypeChange = (value: string) => {
    const nextType = value as QuizQuestionType;
    setValue("type", nextType, { shouldValidate: true });

    if (!question) {
      replace(getDefaultOptionsForType(nextType));
    }
  };

  const handleCorrectToggle = (index: number) => {
    const options = watch("options");
    const type = watch("type");

    if (type === "MULTIPLE_SELECT") {
      setValue(
        `options.${index}.isCorrect`,
        !options[index]?.isCorrect,
        { shouldValidate: true },
      );
      return;
    }

    options.forEach((_, optionIndex) => {
      setValue(
        `options.${optionIndex}.isCorrect`,
        optionIndex === index,
        { shouldValidate: true },
      );
    });
  };

  return (
    <Modal
      open={open}
      title={question ? "Edit Question" : "Add Question"}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <ValidatedField
          label="Question"
          required
          state={getFieldState(errors.questionText)}
          errorMessage={errors.questionText?.message}
        >
          <Textarea
            {...register("questionText")}
            rows={3}
            placeholder="Enter the question text"
            className={validatedFieldInputClass(
              getFieldState(errors.questionText),
            )}
          />
        </ValidatedField>

        <div className="grid gap-4 sm:grid-cols-2">
          <ValidatedField
            label="Type"
            required
            state={getFieldState(errors.type)}
            errorMessage={errors.type?.message}
          >
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <AppSelect
                  value={field.value}
                  options={QUESTION_TYPE_OPTIONS}
                  onValueChange={handleTypeChange}
                />
              )}
            />
          </ValidatedField>

          <ValidatedField
            label="Points"
            required
            state={getFieldState(errors.points)}
            errorMessage={errors.points?.message}
          >
            <Input
              {...register("points")}
              type="number"
              min={1}
              placeholder="1"
              className={validatedFieldInputClass(
                getFieldState(errors.points),
              )}
            />
          </ValidatedField>
        </div>

        <ValidatedField
          label="Explanation"
          state={getFieldState(errors.explanation)}
          errorMessage={errors.explanation?.message}
        >
          <Textarea
            {...register("explanation")}
            rows={2}
            placeholder="Optional explanation shown after answering"
            className={validatedFieldInputClass(
              getFieldState(errors.explanation),
            )}
          />
        </ValidatedField>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-[#102A56]">Options</p>
            {questionType !== "TRUE_FALSE" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ optionText: "", isCorrect: false })
                }
              >
                Add Option
              </Button>
            ) : null}
          </div>

          {errors.options?.message ? (
            <p className="text-xs text-red-600">{errors.options.message}</p>
          ) : null}

          <div className="space-y-2">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-2 rounded-lg border border-slate-200 p-3"
              >
                <button
                  type="button"
                  className={`mt-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    watch(`options.${index}.isCorrect`)
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                  onClick={() => handleCorrectToggle(index)}
                  aria-label="Mark as correct answer"
                >
                  {watch(`options.${index}.isCorrect`) ? "✓" : ""}
                </button>

                <div className="min-w-0 flex-1">
                  <Input
                    {...register(`options.${index}.optionText`)}
                    placeholder={`Option ${index + 1}`}
                    disabled={questionType === "TRUE_FALSE"}
                    className={validatedFieldInputClass(
                      getFieldState(errors.options?.[index]?.optionText),
                    )}
                  />
                  {errors.options?.[index]?.optionText?.message ? (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.options[index]?.optionText?.message}
                    </p>
                  ) : null}
                </div>

                {questionType !== "TRUE_FALSE" && fields.length > 2 ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                ) : null}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            {questionType === "MULTIPLE_SELECT"
              ? "Select all correct answers."
              : "Select exactly one correct answer."}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || isSubmitting}
          >
            {question ? "Save Question" : "Add Question"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
