"use client";

import {
  useEffect,
  useMemo,
} from "react";

import {
  Controller,
  useForm,
} from "react-hook-form";

import {
  zodResolver,
} from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";

import {
  courseLessonSchema,
} from "@/src/features/course-lessons/schemas/course-lesson.schema";

import {
  DEFAULT_COURSE_LESSON_FORM_VALUES,
} from "@/src/features/course-lessons/constants/course-lesson.constants";

import {
  useCourseModules,
} from "@/src/features/course-modules/hooks";

import type {
  CourseLesson,
  CourseLessonFormValues,
} from "@/src/features/course-lessons/types";

interface CourseLessonFormProps {
  open: boolean;

  loading: boolean;
  
  courseId: string;
  
  moduleId: string;

  lesson?: CourseLesson;

  onClose: () => void;

  onSubmit: (
    values: CourseLessonFormValues,
  ) => Promise<void>;
}
export function CourseLessonForm({
  open,
  loading,
  courseId,   
  moduleId,
  lesson,
  onClose,
  onSubmit,
}: CourseLessonFormProps){
  const {
    modules,
    isLoading: isLoadingModules,
  } = useCourseModules({
    courseId,
    includeDeleted: false,
});

  const moduleOptions =
    useMemo(
      () =>
        modules.map(
          (module) => ({
            label:
              `${module.displayOrder}. ${module.title}`,

            value:
              module.id,
          }),
        ),
      [modules],
    );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isSubmitting,
    },
  } =
    useForm<CourseLessonFormValues>(
      {
        resolver:
          zodResolver(
            courseLessonSchema,
          ),

        defaultValues:
          DEFAULT_COURSE_LESSON_FORM_VALUES,

        mode:
          "onBlur",
      },
    );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!lesson) {
      reset({
        ...DEFAULT_COURSE_LESSON_FORM_VALUES,
        moduleId,
      });

      return;
    }

    reset({
      moduleId:
        lesson.moduleId,

      title:
        lesson.title,

      description:
        lesson.description ??
        "",

      videoUrl:
        lesson.videoUrl ??
        "",
    });
  }, [
    lesson,
    moduleId,
    open,
    reset,
  ]);

  const modalTitle =
    lesson
      ? "Edit Lesson"
      : "Create Lesson";

  const submitButtonText =
    lesson
      ? "Update Lesson"
      : "Create Lesson";

  const handleFormSubmit =
    async (
      values: CourseLessonFormValues,
    ) => {
      await onSubmit(
        values,
      );
    };
      return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={onClose}
    >
      <form
        className="space-y-6"
        onSubmit={handleSubmit(
          handleFormSubmit,
        )}
      >
        <div className="space-y-2">
          <Label required>
            Module
          </Label>

          <Controller
            control={control}
            name="moduleId"
            render={({
              field,
            }) => (
              <AppSelect
                value={
                  field.value
                }
                onValueChange={
                  field.onChange
                }
                disabled={
                  true
                }
                options={
                  moduleOptions
                }
                placeholder="Select Module"
              />
            )}
          />

          <FormError
            message={
              errors.moduleId
                ?.message
            }
          />
        </div>

        <div className="space-y-2">
          <Label required>
            Lesson Title
          </Label>

          <Input
            placeholder="Enter lesson title"
            aria-invalid={
              !!errors.title
            }
            disabled={
              loading ||
              isSubmitting
            }
            {...register(
              "title",
            )}
          />

          <FormError
            message={
              errors.title
                ?.message
            }
          />
        </div>

        <div className="space-y-2">
          <Label>
            Description
          </Label>

          <Textarea
            rows={5}
            placeholder="Enter lesson description"
            disabled={
              loading ||
              isSubmitting
            }
            {...register(
              "description",
            )}
          />

          <FormError
            message={
              errors.description
                ?.message
            }
          />
        </div>

        <div className="space-y-2">
          <Label>
            Video URL
          </Label>

          <Input
            placeholder="https://youtube.com/..."
            disabled={
              loading ||
              isSubmitting
            }
            {...register(
              "videoUrl",
            )}
          />

          <FormError
            message={
              errors.videoUrl
                ?.message
            }
          />
        </div>

        <div className="flex justify-end gap-3 border-t pt-6">
          <Button
            type="button"
            variant="outline"
            disabled={
              loading ||
              isSubmitting
            }
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={
              loading ||
              isSubmitting
            }
            disabled={
              loading ||
              isSubmitting
            }
          >
            {submitButtonText}
          </Button>
        </div>
      </form>
    </Modal>
  );
}