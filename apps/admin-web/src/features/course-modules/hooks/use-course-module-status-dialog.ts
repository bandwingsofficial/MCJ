"use client";

import { useCallback, useRef, useState } from "react";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { appToast } from "@/src/shared/components/ui/toast";

import { courseModuleService } from "@/src/features/course-modules/services/course-module.service";
import {
  buildModuleActivateConfirmDescription,
  buildModuleDeactivateBlockedDescription,
  buildModuleDeactivateConfirmDescription,
} from "@/src/features/course-modules/utils/course-module-dependency.utils";

type StatusMode = "deactivate" | "activate";

interface OpenStatusOptions {
  moduleId: string;
  moduleTitle?: string;
  mode: StatusMode;
}

export function useCourseModuleStatusDialog() {
  const [open, setOpen] = useState(false);
  const [canProceed, setCanProceed] = useState(true);
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<StatusMode>("deactivate");
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const requestIdRef = useRef(0);

  const close = useCallback(() => {
    requestIdRef.current += 1;
    setOpen(false);
    setModuleId(null);
    setChecking(false);
  }, []);

  const openStatusDialog = useCallback(
    async ({ moduleId: id, moduleTitle, mode: nextMode }: OpenStatusOptions) => {
      const requestId = ++requestIdRef.current;
      setModuleId(id);
      setMode(nextMode);
      setChecking(true);

      try {
        if (nextMode === "activate") {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setCanProceed(true);
          setDescription(buildModuleActivateConfirmDescription(moduleTitle));
          setOpen(true);
          return;
        }

        const response =
          await courseModuleService.getCourseModuleDependencies(id);

        if (requestId !== requestIdRef.current) {
          return;
        }

        const allowed = response.data.canDeactivate;
        setCanProceed(allowed);
        setDescription(
          allowed
            ? buildModuleDeactivateConfirmDescription(moduleTitle)
            : buildModuleDeactivateBlockedDescription(
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
    canProceed,
    description,
    mode,
    moduleId,
    checking,
    close,
    openStatusDialog,
  };
}
