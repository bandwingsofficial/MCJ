"use client";

import { Modal } from "@/src/shared/components/ui/model";

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

import { courseService } from "@/src/features/courses/services/course.service";

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

export function CourseFormModal({
  open,
  course,
  categoryOptions,
  branchOptions,
  onClose,
  onSuccess,
}: Props) {
  const {
    createCourse,
    isLoading: isCreating,
  } = useCreateCourse();

  const {
    updateCourse,
    isLoading: isUpdating,
  } = useUpdateCourse();

  const isEditMode =
    Boolean(course);

  const isLoading =
    isCreating ||
    isUpdating;

  const handleSubmit =
    async (
      values: CreateCourseFormValues,
      image: File | null
    ) => {
      try {
        let thumbnailFileId:
          | string
          | undefined;

        if (image) {
          const uploadResponse =
            await courseService.uploadCourseImage(
              image
            );

          thumbnailFileId =
            uploadResponse.data.fileId;
        }

        if (
          isEditMode &&
          course
        ) {
          await updateCourse(
            course.id,
            {
              ...values,
              thumbnailFileId,
            }
          );

          appToast.success(
            "Course updated successfully"
          );
        } else {
          await createCourse({
            ...values,
            thumbnailFileId,
          });

          appToast.success(
            "Course created successfully"
          );
        }

        await onSuccess();

        onClose();
      } catch (error) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      }
    };

  return (
    <Modal
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

                branchIds:
                  course.branchId
                    ? [
                        course.branchId,
                      ]
                    : [],

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

                modes:
                  course.mode
                    ? [
                        course.mode,
                      ]
                    : [],

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

                thumbnailUrl:
                  course.thumbnailUrl ??
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
    </Modal>
  );
}