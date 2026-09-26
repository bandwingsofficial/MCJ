"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";

import { Button } from "@/src/shared/components/ui/button";
import { FileUploadField } from "@/src/shared/components/ui/file-upload-field";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";
import {
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";

import { DEFAULT_COURSE_LEARN_ITEM_FORM_VALUES } from "@/src/features/course-learn-items/constants/course-learn-item.constants";
import type {
  CourseLearnItem,
  CourseLearnItemFormValues,
} from "@/src/features/course-learn-items/types";
import { parseKeyLearningPoints } from "@/src/features/course-learn-items/utils/key-learning-points.utils";
import { getSyncFieldState } from "@/src/features/course-modules/utils/module-form-validation";

const learnItemFormSchema = z.object({
  lessonId: z.string(),
  title: z.string().trim().min(1, "Question/title is required."),
  explanation: z.string().trim().min(1, "Answer/explanation is required."),
  imageUrl: z.string(),
  keyLearningPoints: z.array(z.object({ value: z.string() })),
  finalThoughts: z.string(),
  summary: z.string(),
});

type LearnItemFormValues = z.infer<typeof learnItemFormSchema>;

function UnlimitedCharCounter({ value }: { value: string }) {
  return (
    <p className="mt-1 text-right text-xs text-[#8AA0BB]">
      {value.length} / ∞
    </p>
  );
}

interface CourseLearnItemFormProps {
  open: boolean;
  loading: boolean;
  lessonId: string;
  item?: CourseLearnItem;
  onClose: () => void;
  onSubmit: (
    values: CourseLearnItemFormValues,
    imageFile: File | null,
    removeImage: boolean,
  ) => Promise<void>;
}

export function CourseLearnItemForm({
  open,
  loading,
  lessonId,
  item,
  onClose,
  onSubmit,
}: CourseLearnItemFormProps) {
  const isEdit = Boolean(item);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, touchedFields, isSubmitted, isSubmitting },
  } = useForm<LearnItemFormValues>({
    resolver: zodResolver(learnItemFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      ...DEFAULT_COURSE_LEARN_ITEM_FORM_VALUES,
      keyLearningPoints: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "keyLearningPoints",
  });

  const titleValue = watch("title") ?? "";
  const explanationValue = watch("explanation") ?? "";
  const finalThoughtsValue = watch("finalThoughts") ?? "";
  const summaryValue = watch("summary") ?? "";

  useEffect(() => {
    if (!open) {
      setSelectedImage(null);
      setRemoveImage(false);
      return;
    }

    if (!item) {
      reset({
        ...DEFAULT_COURSE_LEARN_ITEM_FORM_VALUES,
        lessonId,
        keyLearningPoints: [],
      });
      return;
    }

    reset({
      lessonId: item.lessonId,
      title: item.title,
      explanation: item.explanation,
      imageUrl: item.imageUrl ?? "",
      keyLearningPoints: parseKeyLearningPoints(item.keyLearningPoints).map(
        (point) => ({ value: point }),
      ),
      finalThoughts: item.finalThoughts ?? "",
      summary: item.summary ?? "",
    });
  }, [open, lessonId, item, reset]);

  const titleState = getSyncFieldState(
    Boolean(touchedFields.title || (isSubmitted && errors.title)),
    errors.title?.message,
    titleValue,
    { required: true },
  );

  const explanationState = getSyncFieldState(
    Boolean(touchedFields.explanation || (isSubmitted && errors.explanation)),
    errors.explanation?.message,
    explanationValue,
    { required: true },
  );

  const finalThoughtsState = getSyncFieldState(
    Boolean(touchedFields.finalThoughts || (isSubmitted && errors.finalThoughts)),
    errors.finalThoughts?.message,
    finalThoughtsValue,
  );

  const summaryState = getSyncFieldState(
    Boolean(touchedFields.summary || (isSubmitted && errors.summary)),
    errors.summary?.message,
    summaryValue,
  );

  const existingImageUrl =
    !removeImage && !selectedImage ? (item?.imageUrl ?? null) : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Learn Item" : "Add Learn Item"}
      contentClassName="max-w-3xl"
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(
            {
              ...values,
              keyLearningPoints: values.keyLearningPoints
                .map((point) => point.value.trim())
                .filter(Boolean),
            },
            selectedImage,
            removeImage,
          );
        })}
      >
        <ValidatedField
          label="Question / Title"
          required
          state={titleState}
          errorMessage={errors.title?.message}
          className="w-full"
        >
          <Input
            {...register("title")}
            placeholder="What is a Variable?"
            disabled={loading || isSubmitting}
            className={validatedFieldInputClass(titleState, "w-full")}
          />
          <UnlimitedCharCounter value={titleValue} />
        </ValidatedField>

        <ValidatedField
          label="Answer / Explanation"
          required
          state={explanationState}
          errorMessage={errors.explanation?.message}
          className="w-full"
        >
          <Textarea
            {...register("explanation")}
            rows={5}
            placeholder="Explain the concept clearly for students."
            disabled={loading || isSubmitting}
            className={validatedFieldInputClass(explanationState, "min-h-[140px] w-full")}
          />
          <UnlimitedCharCounter value={explanationValue} />
        </ValidatedField>

        <div className="space-y-2">
          <p className="text-sm font-medium text-[#102A56]">Image (optional)</p>
          <FileUploadField
            file={selectedImage}
            existingFileUrl={existingImageUrl}
            accept="image/*"
            hint="PNG, JPG, or WEBP"
            browseLabel="Browse Image"
            onFileSelect={(file) => {
              setSelectedImage(file);
              if (file) {
                setRemoveImage(false);
              }
            }}
          />
          {existingImageUrl || selectedImage ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              onClick={() => {
                setSelectedImage(null);
                setRemoveImage(true);
              }}
            >
              Remove Image
            </Button>
          ) : null}
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium text-[#102A56]">Key Learning Points</p>

          {fields.length > 0 ? (
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <Input
                      {...register(`keyLearningPoints.${index}.value`)}
                      placeholder={`Point ${index + 1}`}
                      disabled={loading || isSubmitting}
                      className="w-full"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-0.5 shrink-0 rounded-lg border-red-200 text-red-700 hover:bg-red-50"
                    disabled={loading || isSubmitting}
                    onClick={() => remove(index)}
                    aria-label={`Delete point ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg"
            disabled={loading || isSubmitting}
            onClick={() => append({ value: "" })}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Point
          </Button>
        </div>

        <ValidatedField
          label="Final Thoughts"
          state={finalThoughtsState}
          errorMessage={errors.finalThoughts?.message}
          className="w-full"
        >
          <Textarea
            {...register("finalThoughts")}
            rows={3}
            className={validatedFieldInputClass(finalThoughtsState, "w-full")}
            placeholder="Closing reflection for this learn item."
            disabled={loading || isSubmitting}
          />
        </ValidatedField>

        <ValidatedField
          label="Summary"
          state={summaryState}
          errorMessage={errors.summary?.message}
          className="w-full"
        >
          <Textarea
            {...register("summary")}
            rows={3}
            className={validatedFieldInputClass(summaryState, "w-full")}
            placeholder="Short recap of this learn item."
            disabled={loading || isSubmitting}
          />
        </ValidatedField>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={onClose}
            disabled={loading || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-lg bg-[#0B1F3A] hover:bg-[#102A56]"
            loading={loading || isSubmitting}
          >
            {isEdit ? "Save Changes" : "Add Learn Item"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
