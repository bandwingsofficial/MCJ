"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { getUploadFileId, withImageCacheBust } from "@/src/shared/utils/upload-image.util";

import { CourseForm } from "@/src/features/courses/components/course-form";
import { CreateCourseFormValues } from "@/src/features/courses/schemas/course.schema";
import { CourseDetails } from "@/src/features/courses/types/course.types";
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
  onClose: () => void;
  onSuccess: (createdCourseId?: string) => Promise<void>;
}

function toCoursePayload(
  values: CreateCourseFormValues,
  isEditMode: boolean,
  thumbnailFileId?: string | null,
) {
  return {
    title: values.title,
    tagline: values.tagline?.trim() || undefined,
    shortDescription: values.shortDescription?.trim() || undefined,
    description: values.description?.trim() || undefined,
    categoryId: values.categoryId,
    level: values.level,
    minimumQualifications: values.minimumQualifications,
    language: values.language,
    averageRating: Number(values.averageRating ?? 0),
    totalReviews: Number(values.totalReviews ?? 0),
    displayOrder: isEditMode ? values.displayOrder : undefined,
    slug: values.slug?.trim() || undefined,
    metaTitle: values.metaTitle?.trim() || undefined,
    metaDescription: values.metaDescription?.trim() || undefined,
    metaKeywords: values.metaKeywords?.trim() || undefined,
    thumbnailFileId: thumbnailFileId ?? undefined,
  };
}

export function CourseFormModal({
  open,
  course,
  categoryOptions,
  onClose,
  onSuccess,
}: Props) {
  const { createCourse, isLoading: isCreating } = useCreateCourse();
  const { updateCourse, isLoading: isUpdating } = useUpdateCourse();

  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [isSuggestingCode, setIsSuggestingCode] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  const isEditMode = Boolean(course);
  const isLoading = isCreating || isUpdating;

  const formSeedKey = useMemo(
    () =>
      course
        ? `${course.id}-${course.updatedAt}`
        : open
          ? "create"
          : "closed",
    [course, open],
  );

  const defaultValues = useMemo(
    () =>
      course
        ? {
            title: course.title,
            tagline: course.tagline ?? "",
            shortDescription: course.shortDescription ?? "",
            description: course.description ?? "",
            categoryId: course.categoryId,
            level: course.level,
            minimumQualifications: course.minimumQualifications ?? [],
            language: course.language,
            averageRating: course.averageRating,
            totalReviews: course.totalReviews,
            displayOrder: course.displayOrder,
            slug: course.slug ?? "",
            metaTitle: course.metaTitle ?? "",
            metaDescription: course.metaDescription ?? "",
            metaKeywords: course.metaKeywords ?? "",
            thumbnailUrl: course.thumbnailUrl
              ? withImageCacheBust(course.thumbnailUrl, course.updatedAt)
              : course.thumbnailUrl,
            status: course.status,
          }
        : undefined,
    [course],
  );

  useEffect(() => {
    if (!open || isEditMode) {
      return;
    }

    let cancelled = false;

    const loadSuggestedCode = async () => {
      try {
        setIsSuggestingCode(true);
        const response = await courseService.suggestCourseCode();
        if (!cancelled) {
          setSuggestedCode(response.data.courseCode);
        }
      } catch (error) {
        if (!cancelled) {
          setSuggestedCode(null);
          appToast.error(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsSuggestingCode(false);
        }
      }
    };

    void loadSuggestedCode();

    return () => {
      cancelled = true;
    };
  }, [open, isEditMode]);

  const handleSubmit = async (
    values: CreateCourseFormValues,
    image: File | null,
    removeImage: boolean,
  ) => {
    try {
      let thumbnailFileId: string | null | undefined;

      if (image) {
        setIsUploadingImage(true);

        try {
          const uploadResponse = await courseService.uploadCourseImage(image);
          thumbnailFileId = getUploadFileId(uploadResponse);
        } finally {
          setIsUploadingImage(false);
        }
      } else if (removeImage && isEditMode) {
        thumbnailFileId = null;
      }

      const payload = toCoursePayload(values, isEditMode, thumbnailFileId);

      if (isEditMode && course) {
        await updateCourse(course.id, payload);
        appToast.success("Course updated successfully");
        await onSuccess();
      } else {
        const created = await createCourse(payload);
        appToast.success("Course created successfully");
        await onSuccess(created.id);
      }

      onClose();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      title={isEditMode ? "Edit Course" : "Create Course"}
      onClose={onClose}
      contentClassName="min-w-0"
      bodyRef={bodyRef}
    >
      <CourseForm
        key={formSeedKey}
        formSeedKey={formSeedKey}
        courseCode={isEditMode ? course?.code : suggestedCode}
        isEdit={isEditMode}
        categoryOptions={categoryOptions}
        isLoading={isLoading}
        isUploadingImage={isUploadingImage || isSuggestingCode}
        submitLabel={isEditMode ? "Update Course" : "Create Course"}
        loadingLabel={
          isEditMode ? "Updating Course..." : "Creating Course..."
        }
        onCancel={onClose}
        dropdownBoundaryRef={bodyRef}
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
