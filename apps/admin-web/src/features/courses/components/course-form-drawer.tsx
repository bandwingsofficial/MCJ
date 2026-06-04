"use client";

import { Drawer } from "@/src/shared/components/ui/drawer";

import { appToast } from "@/src/shared/components/ui/toast";

import { CourseForm } from "@/src/features/courses/components/course-form";

import {
  CreateCourseFormValues,
} from "@/src/features/courses/schemas/course.schema";

import {
  CourseDetails,
} from "@/src/features/courses/types/course.types";

import { useCreateCourse } from "@/src/features/courses/hooks/use-create-course";

import { useUpdateCourse } from "@/src/features/courses/hooks/use-update-course";

interface SelectOption {
  label: string;
  value: string;
}

interface Props {
  open: boolean;

  course?: CourseDetails | null;

  categoryOptions: SelectOption[];

  branchOptions: SelectOption[];

  onClose: () => void;

  onSuccess: () => Promise<void>;
}

export function CourseFormDrawer({
  open,
  course,
  categoryOptions,
  branchOptions,
  onClose,
  onSuccess,
}: Props) {
  const {
    createCourse,
    isLoading:
      isCreating,
  } = useCreateCourse();

  const {
    updateCourse,
    isLoading:
      isUpdating,
  } = useUpdateCourse();

  const isEditMode =
    Boolean(course);

  const isLoading =
    isCreating ||
    isUpdating;

  const handleSubmit =
    async (
      values: CreateCourseFormValues
    ) => {
      try {
        if (
          isEditMode &&
          course
        ) {
          await updateCourse(
            course.id,
            values
          );

          appToast.success(
            "Course updated successfully"
          );
        } else {
          await createCourse(
            values
          );

          appToast.success(
            "Course created successfully"
          );
        }

        await onSuccess();

        onClose();
      } catch (
        error
      ) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      }
    };

  return (
    <Drawer
      open={open}
      title={
        isEditMode
          ? "Edit Course"
          : "Create Course"
      }
      onClose={onClose}
    >
      <CourseForm
        defaultValues={
          course
            ? {
                title:
                  course.title,

                tagline:
                  course.tagline ??
                  undefined,

                shortDescription:
                  course.shortDescription ??
                  undefined,

                description:
                  course.description ??
                  undefined,

                categoryId:
                  course.categoryId,

                branchId:
                  course.branchId ??
                  undefined,

                originalPrice:
                  course.originalPrice,

                discountPrice:
                  course.discountPrice,

                currency:
                  course.currency,

                isFree:
                  course.isFree,

                duration:
                  course.duration ??
                  undefined,

                durationType:
                  course.durationType ??
                  undefined,

                level:
                  course.level,

                mode:
                  course.mode,

                language:
                  course.language,

                displayOrder:
                  course.displayOrder,

                metaTitle:
                  course.metaTitle ??
                  undefined,

                metaDescription:
                  course.metaDescription ??
                  undefined,

                metaKeywords:
                  course.metaKeywords ??
                  undefined,
              }
            : undefined
        }
        categoryOptions={
          categoryOptions
        }
        branchOptions={
          branchOptions
        }
        isLoading={
          isLoading
        }
        submitLabel={
          isEditMode
            ? "Update Course"
            : "Create Course"
        }
        onSubmit={
          handleSubmit
        }
      />
    </Drawer>
  );
}