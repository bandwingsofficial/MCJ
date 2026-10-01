"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  LearningContentMode,
  ModuleTreeDto,
} from "@/src/features/learning/types/learning.types";
import {
  createInitialLessonSelectionByMode,
  createInitialModuleExpansionByMode,
  DEFAULT_MODE_VIDEO_SELECTION,
  EMPTY_MODE_LESSON_SELECTION,
  EMPTY_MODE_MODULE_EXPANSION,
  parseLearningContentModeFromSearch,
  type ModeModuleExpansionState,
  type ModeNavigationState,
  type ModeVideoSelectionState,
} from "@/src/features/learning/utils/learning-mode-navigation.utils";
import { findModuleForLesson } from "@/src/features/learning/utils/progress.utils";
import type { ProgressMap } from "@/src/features/learning/utils/progress.utils";
import { getLessonLearningPath } from "@/src/features/learning/utils/routes.utils";

interface UseLearningModeNavigationOptions {
  courseId: string;
  urlLessonId: string;
  modules: ModuleTreeDto[];
  progressMap: ProgressMap;
  canAccessLiveRecorded: boolean;
}

export function useLearningModeNavigation({
  courseId,
  urlLessonId,
  modules,
  progressMap,
  canAccessLiveRecorded,
}: UseLearningModeNavigationOptions) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialMode = parseLearningContentModeFromSearch(
    searchParams.get("mode"),
  );
  const safeInitialMode =
    initialMode === "live_recorded" && !canAccessLiveRecorded
      ? "self_paced"
      : initialMode;

  const [activeMode, setActiveMode] =
    useState<LearningContentMode>(safeInitialMode);
  const [openMode, setOpenMode] = useState<LearningContentMode | null>(
    safeInitialMode,
  );

  const [selectedLessonByMode, setSelectedLessonByMode] =
    useState<ModeNavigationState>(EMPTY_MODE_LESSON_SELECTION);

  const [expandedModuleByMode, setExpandedModuleByMode] =
    useState<ModeModuleExpansionState>(EMPTY_MODE_MODULE_EXPANSION);

  const [videoSelectionByMode, setVideoSelectionByMode] =
    useState<ModeVideoSelectionState>(DEFAULT_MODE_VIDEO_SELECTION);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || modules.length === 0) {
      return;
    }

    const selected = createInitialLessonSelectionByMode(
      modules,
      progressMap,
      urlLessonId,
    );
    const expanded = createInitialModuleExpansionByMode(modules, selected);

    setSelectedLessonByMode(selected);
    setExpandedModuleByMode(expanded);
    initializedRef.current = true;
  }, [modules, progressMap, urlLessonId]);

  useEffect(() => {
    if (!initializedRef.current) {
      return;
    }

    setSelectedLessonByMode((current) => ({
      ...current,
      [activeMode]: urlLessonId,
    }));

    const moduleForUrl = findModuleForLesson(modules, urlLessonId);
    if (moduleForUrl) {
      setExpandedModuleByMode((current) => ({
        ...current,
        [activeMode]: moduleForUrl.id,
      }));
    }
  }, [urlLessonId, activeMode, modules]);

  useEffect(() => {
    const modeFromUrl = parseLearningContentModeFromSearch(
      searchParams.get("mode"),
    );
    const nextMode =
      modeFromUrl === "live_recorded" && !canAccessLiveRecorded
        ? "self_paced"
        : modeFromUrl;

    setActiveMode(nextMode);
    setOpenMode(nextMode);
  }, [searchParams, canAccessLiveRecorded]);

  useEffect(() => {
    if (activeMode === "live_recorded" && !canAccessLiveRecorded) {
      setActiveMode("self_paced");
      setOpenMode("self_paced");
    }
  }, [activeMode, canAccessLiveRecorded]);

  const navigateToLesson = useCallback(
    (mode: LearningContentMode, lessonId: string) => {
      if (mode === activeMode) {
        router.push(getLessonLearningPath(courseId, lessonId, mode));
        return;
      }

      setSelectedLessonByMode((current) => ({
        ...current,
        [mode]: lessonId,
      }));
    },
    [activeMode, courseId, router],
  );

  const activateMode = useCallback(
    (mode: LearningContentMode) => {
      if (mode === "live_recorded" && !canAccessLiveRecorded) {
        return;
      }

      setOpenMode(mode);
      setActiveMode(mode);

      const targetLessonId = selectedLessonByMode[mode] ?? urlLessonId;
      if (!targetLessonId) {
        return;
      }

      router.push(getLessonLearningPath(courseId, targetLessonId, mode));
    },
    [
      canAccessLiveRecorded,
      courseId,
      router,
      selectedLessonByMode,
      urlLessonId,
    ],
  );

  const toggleOpenMode = useCallback(
    (mode: LearningContentMode) => {
      if (openMode === mode) {
        setOpenMode(null);
        return;
      }

      activateMode(mode);
    },
    [activateMode, openMode],
  );

  const toggleModule = useCallback(
    (mode: LearningContentMode, moduleId: string) => {
      setExpandedModuleByMode((current) => ({
        ...current,
        [mode]: current[mode] === moduleId ? null : moduleId,
      }));
    },
    [],
  );

  const selectLesson = useCallback(
    (mode: LearningContentMode, lessonId: string, moduleId: string) => {
      if (mode === "live_recorded" && !canAccessLiveRecorded) {
        return;
      }

      setSelectedLessonByMode((current) => ({
        ...current,
        [mode]: lessonId,
      }));

      setExpandedModuleByMode((current) => ({
        ...current,
        [mode]: moduleId,
      }));

      setVideoSelectionByMode((current) => ({
        ...current,
        [mode]: { videoId: null, index: 0 },
      }));

      setActiveMode(mode);
      setOpenMode(mode);
      router.push(getLessonLearningPath(courseId, lessonId, mode));
    },
    [canAccessLiveRecorded, courseId, router],
  );

  const setVideoSelection = useCallback(
    (mode: LearningContentMode, selection: { videoId?: string; index?: number }) => {
      setVideoSelectionByMode((current) => ({
        ...current,
        [mode]: {
          videoId: selection.videoId ?? current[mode].videoId,
          index: selection.index ?? current[mode].index,
        },
      }));
    },
    [],
  );

  const displayLessonId =
    selectedLessonByMode[activeMode] ?? urlLessonId;

  return {
    activeMode,
    openMode,
    selectedLessonByMode,
    expandedModuleByMode,
    videoSelectionByMode,
    displayLessonId,
    toggleOpenMode,
    toggleModule,
    selectLesson,
    navigateToLesson,
    activateMode,
    setVideoSelection,
  };
}
