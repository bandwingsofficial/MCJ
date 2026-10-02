"use client";

import { useCallback, useRef, useState } from "react";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { appToast } from "@/src/shared/components/ui/toast";

import type { ModuleDeleteContentCounts } from "@/src/features/course-modules/components/CourseModuleDeleteDialog";
import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
import {
  buildModuleDeleteBlockedDescription,
  buildModuleDeleteConfirmDescription,
} from "@/src/features/course-modules/utils/course-module-dependency.utils";

interface OpenModuleDeleteOptions {
  moduleId: string;
  moduleTitle?: string;
  contentCounts?: ModuleDeleteContentCounts;
}

export function useCourseModuleDeleteDialog() {
  const [open, setOpen] = useState(false);
  const [canDelete, setCanDelete] = useState(true);
  const [description, setDescription] = useState("");
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const requestIdRef = useRef(0);

  const close = useCallback(() => {
    requestIdRef.current += 1;
    setOpen(false);
    setModuleId(null);
    setChecking(false);
  }, []);

  const openDeleteDialog = useCallback(
    async ({
      moduleId: id,
      moduleTitle,
      contentCounts,
    }: OpenModuleDeleteOptions) => {
      const requestId = ++requestIdRef.current;
      setModuleId(id);
      setChecking(true);

      try {
        const response =
          await courseModuleService.getCourseModuleDependencies(id);

        if (requestId !== requestIdRef.current) {
          return;
        }

        const allowed = response.data.canDelete;
        setCanDelete(allowed);
        setDescription(
          allowed
            ? buildModuleDeleteConfirmDescription(
                moduleTitle,
                contentCounts,
              )
            : buildModuleDeleteBlockedDescription(
                response.data.blockingLessons,
              ),
        );
        setOpen(true);
      } catch (error) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        appToast.error(getErrorMessage(error));
        setModuleId(null);
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
    moduleId,
    checking,
    close,
    openDeleteDialog,
  };
}
