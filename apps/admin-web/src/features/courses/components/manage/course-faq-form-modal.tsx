"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { HelpCircle, MessageSquareText } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { WordCount } from "@/src/shared/components/ui/word-count";
import { truncateToMaxWords } from "@/src/shared/utils/word-count";
import { cn } from "@/src/shared/lib/cn";
import { getWordCountState } from "@/src/features/courses/utils/course-form-validation";

import {
  courseFaqSchema,
  COURSE_FAQ_MAX_WORDS,
  type CourseFaqFormValues,
} from "@/src/features/courses/schemas/course-faq.schema";
import type { CourseFaq } from "@/src/features/courses/types/course-faq.types";

interface Props {
  open: boolean;
  faq?: CourseFaq | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (values: CourseFaqFormValues) => Promise<void>;
}

function inputClass(state: FieldVisualState, extra = "") {
  return validatedFieldInputClass(state, cn("w-full min-w-0", extra));
}

function iconInputClass(state: FieldVisualState, extra = "") {
  return cn(inputClass(state, extra), "pr-16");
}

export function CourseFaqFormModal({
  open,
  faq,
  isSubmitting = false,
  onClose,
  onSubmit,
}: Props) {
  const isEdit = Boolean(faq);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, touchedFields, isSubmitted },
  } = useForm<CourseFaqFormValues>({
    resolver: zodResolver(courseFaqSchema),
    defaultValues: {
      question: "",
      answer: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) {
      reset({
        question: faq?.question ?? "",
        answer: faq?.answer ?? "",
      });
    }
  }, [open, faq, reset]);

  const showValidation = isSubmitted;
  const questionValue = watch("question");
  const answerValue = watch("answer");

  const questionState = getWordCountState(
    Boolean(touchedFields.question || showValidation),
    errors.question?.message,
    questionValue,
    COURSE_FAQ_MAX_WORDS,
  );

  const answerState = getWordCountState(
    Boolean(touchedFields.answer || showValidation),
    errors.answer?.message,
    answerValue,
    COURSE_FAQ_MAX_WORDS,
  );

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    reset();
    onClose();
  };

  const questionRegister = register("question");
  const answerRegister = register("answer");

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit FAQ" : "Create FAQ"}
      onClose={handleClose}
      contentClassName="min-w-0 max-w-2xl"
      bodyClassName="px-4 py-4 sm:px-6 sm:py-5"
    >
      <form
        className="min-w-0 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          reset();
        })}
        noValidate
      >
        <ValidatedField
          label="Question"
          required
          state={questionState}
          errorMessage={errors.question?.message}
        >
          <>
            <Input
              placeholder="Enter the FAQ question (minimum 10 words)"
              disabled={isSubmitting}
              className={iconInputClass(questionState)}
              value={questionValue ?? ""}
              onChange={(event) => {
                const next = truncateToMaxWords(
                  event.target.value,
                  COURSE_FAQ_MAX_WORDS,
                );
                setValue("question", next, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              onBlur={questionRegister.onBlur}
            />
            <HelpCircle
              className="pointer-events-none absolute right-9 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
          </>
          <WordCount
            value={questionValue ?? ""}
            maxWords={COURSE_FAQ_MAX_WORDS}
          />
        </ValidatedField>

        <ValidatedField
          label="Answer"
          required
          state={answerState}
          errorMessage={errors.answer?.message}
        >
          <>
            <Textarea
              rows={5}
              placeholder="Enter the FAQ answer (minimum 10 words)"
              disabled={isSubmitting}
              className={iconInputClass(answerState, "min-h-[7rem] resize-y")}
              value={answerValue ?? ""}
              onChange={(event) => {
                const next = truncateToMaxWords(
                  event.target.value,
                  COURSE_FAQ_MAX_WORDS,
                );
                setValue("answer", next, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              }}
              onBlur={answerRegister.onBlur}
            />
            <MessageSquareText
              className="pointer-events-none absolute right-9 top-3 z-[1] h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
          </>
          <WordCount value={answerValue ?? ""} maxWords={COURSE_FAQ_MAX_WORDS} />
        </ValidatedField>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="w-full sm:w-auto"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isEdit ? "Update FAQ" : "Create FAQ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
