"use client";

import { useCallback, useRef, useState } from "react";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { appToast } from "@/src/shared/components/ui/toast";

import { courseLessonService } from "@/src/features/course-lessons/services/course-lesson.service";
import {
  buildLessonDeleteBlockedDescription,
  buildLessonDeleteConfirmDescription,
} from "@/src/features/course-lessons/utils/course-lesson-dependency.utils";

interface OpenLessonDeleteOptions {
  lessonId: string;
  lessonTitle?: string;
  contentLabel?: string;
}

export function useCourseLessonDeleteDialog() {
  const [open, setOpen] = useState(false);
  const [canDelete, setCanDelete] = useState(true);
  const [description, setDescription] = useState("");
  const [contentLabel, setContentLabel] = useState("lesson");
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const requestIdRef = useRef(0);

  const close = useCallback(() => {
    requestIdRef.current += 1;
    setOpen(false);
    setLessonId(null);
    setChecking(false);
  }, []);

  const openDeleteDialog = useCallback(
    async ({
      lessonId: id,
      lessonTitle,
      contentLabel: label = "lesson",
    }: OpenLessonDeleteOptions) => {
      const requestId = ++requestIdRef.current;
      setLessonId(id);
      setContentLabel(label);
      setChecking(true);

      try {
        const response =
          await courseLessonService.getCourseLessonDependencies(id);

        if (requestId !== requestIdRef.current) {
          return;
        }

        const allowed = response.data.canDelete;
        setCanDelete(allowed);
        setDescription(
          allowed
            ? buildLessonDeleteConfirmDescription(lessonTitle, label)
            : buildLessonDeleteBlockedDescription(response.data.blocking),
        );
        setOpen(true);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        appToast.error(getErrorMessage(error));
        setLessonId(null);
      } finally {
        if (requestId === requestIdRef.current) {
          setChecking(false);
        }
      }
    },
    [],
  );

  return {
    open,
    canDelete,
    description,
    contentLabel,
    lessonId,
    checking,
    close,
    openDeleteDialog,
  };
}
