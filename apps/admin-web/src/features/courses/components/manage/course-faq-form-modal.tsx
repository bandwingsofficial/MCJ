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
} from "@/src/shared/components/ui/validated-field";
import { getSyncFieldState } from "@/src/features/courses/utils/course-form-validation";

import {
  courseFaqSchema,
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

function inputClass(state: ReturnType<typeof getSyncFieldState>, extra = "") {
  return validatedFieldInputClass(state, `w-full min-w-0 ${extra}`);
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
    formState: { errors, touchedFields },
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

  const questionValue = watch("question");
  const answerValue = watch("answer");

  const questionState = getSyncFieldState(
    Boolean(touchedFields.question),
    errors.question?.message,
    questionValue,
    { required: true },
  );

  const answerState = getSyncFieldState(
    Boolean(touchedFields.answer),
    errors.answer?.message,
    answerValue,
    { required: true },
  );

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit FAQ" : "Create FAQ"}
      onClose={handleClose}
      contentClassName="min-w-0 max-w-2xl"
    >
      <form
        className="min-w-0 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          reset();
        })}
      >
        <ValidatedField
          label="Question"
          required
          state={questionState}
          errorMessage={errors.question?.message}
        >
          <Input
            placeholder="Enter the FAQ question"
            className={inputClass(questionState, "pr-10")}
            {...register("question")}
          />
          <HelpCircle
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        </ValidatedField>

        <ValidatedField
          label="Answer"
          required
          state={answerState}
          errorMessage={errors.answer?.message}
        >
          <Textarea
            rows={5}
            placeholder="Enter the FAQ answer"
            className={inputClass(answerState, "min-h-[7rem] resize-y pr-10")}
            {...register("answer")}
          />
          <MessageSquareText
            className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
        </ValidatedField>

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            {isEdit ? "Update FAQ" : "Create FAQ"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
