import type {
  LearningContentMode,
  LessonTreeDto,
  LessonVideoDto,
  ModuleTreeDto,
} from "@/src/features/learning/types/learning.types";

import {
  findModuleForLessonOrdered,
  sortLessons,
  sortModules,
} from "@/src/features/learning/utils/course-hierarchy.utils";
import type { ProgressMap } from "@/src/features/learning/utils/progress.utils";
import { findContinueLesson } from "@/src/features/learning/utils/progress.utils";

export type ModeNavigationState = Record<LearningContentMode, string | null>;
export type ModeModuleExpansionState = Record<
  LearningContentMode,
  string | null
>;

export interface ModeVideoSelection {
  videoId: string | null;
  index: number;
}

export type ModeVideoSelectionState = Record<
  LearningContentMode,
  ModeVideoSelection
>;

export const EMPTY_MODE_LESSON_SELECTION: ModeNavigationState = {
  live_recorded: null,
  self_paced: null,
};

export const EMPTY_MODE_MODULE_EXPANSION: ModeModuleExpansionState = {
  live_recorded: null,
  self_paced: null,
};

export const DEFAULT_MODE_VIDEO_SELECTION: ModeVideoSelectionState = {
  live_recorded: { videoId: null, index: 0 },
  self_paced: { videoId: null, index: 0 },
};

export function parseLearningContentModeFromSearch(
  value: string | null | undefined,
): LearningContentMode {
  if (value === "recorded" || value === "live_recorded") {
    return "live_recorded";
  }

  return "self_paced";
}

export function learningContentModeToSearchParam(
  mode: LearningContentMode,
): string {
  return mode === "live_recorded" ? "recorded" : "self_paced";
}

function sortVideos(videos: LessonVideoDto[]): LessonVideoDto[] {
  return [...videos].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );
}

export function getSelfPacedVideoEntries(
  lesson: LessonTreeDto,
): LessonVideoDto[] {
  const ordered = sortVideos(lesson.selfPacedVideos ?? []);

  if (lesson.videoUrl && ordered.every((video) => !video.videoUrl)) {
    return ordered;
  }

  return ordered;
}

export function getLiveRecordedVideoEntries(
  lesson: LessonTreeDto,
): LessonVideoDto[] {
  return sortVideos(lesson.liveRecordedVideos ?? []);
}

export function getVideoEntriesForMode(
  lesson: LessonTreeDto,
  mode: LearningContentMode,
): LessonVideoDto[] {
  return mode === "live_recorded"
    ? getLiveRecordedVideoEntries(lesson)
    : getSelfPacedVideoEntries(lesson);
}

export function resolveVideoUrlForMode(
  lesson: LessonTreeDto,
  mode: LearningContentMode,
  selection: ModeVideoSelection,
): string | null {
  if (mode === "self_paced") {
    if (selection.videoId) {
      const match = (lesson.selfPacedVideos ?? []).find(
        (video) => video.id === selection.videoId,
      );
      if (match?.videoUrl) {
        return match.videoUrl;
      }
    }

    if (lesson.videoUrl && selection.index <= 0) {
      const ordered = getSelfPacedVideoEntries(lesson);
      if (ordered.length === 0 || !ordered[0]?.videoUrl) {
        return lesson.videoUrl;
      }
    }

    const entries = getSelfPacedVideoEntries(lesson).filter(
      (video) => video.videoUrl,
    );

    if (entries.length === 0 && lesson.videoUrl) {
      return lesson.videoUrl;
    }

    const index = Math.min(
      Math.max(selection.index, 0),
      Math.max(entries.length - 1, 0),
    );

    return entries[index]?.videoUrl ?? null;
  }

  if (selection.videoId) {
    const match = (lesson.liveRecordedVideos ?? []).find(
      (video) => video.id === selection.videoId,
    );
    if (match?.videoUrl) {
      return match.videoUrl;
    }
  }

  const entries = getLiveRecordedVideoEntries(lesson).filter(
    (video) => video.videoUrl,
  );
  const index = Math.min(
    Math.max(selection.index, 0),
    Math.max(entries.length - 1, 0),
  );

  return entries[index]?.videoUrl ?? null;
}

export function getFirstLessonId(modules: ModuleTreeDto[]): string | null {
  const orderedModules = sortModules(modules);

  for (const module of orderedModules) {
    const lessons = sortLessons(module.lessons);
    if (lessons[0]?.id) {
      return lessons[0].id;
    }
  }

  return null;
}

export function createInitialLessonSelectionByMode(
  modules: ModuleTreeDto[],
  progressMap: ProgressMap,
  urlLessonId: string,
): ModeNavigationState {
  const continueLesson = findContinueLesson(modules, progressMap);
  const fallback =
    urlLessonId || continueLesson?.id || getFirstLessonId(modules);

  return {
    live_recorded: fallback,
    self_paced: fallback,
  };
}

export function createInitialModuleExpansionByMode(
  modules: ModuleTreeDto[],
  selectedLessonByMode: ModeNavigationState,
): ModeModuleExpansionState {
  const firstModuleId = sortModules(modules)[0]?.id ?? null;

  const moduleForRecorded = selectedLessonByMode.live_recorded
    ? findModuleForLessonOrdered(modules, selectedLessonByMode.live_recorded)
        ?.id
    : null;

  const moduleForSelfPaced = selectedLessonByMode.self_paced
    ? findModuleForLessonOrdered(modules, selectedLessonByMode.self_paced)?.id
    : null;

  return {
    live_recorded: moduleForRecorded ?? firstModuleId,
    self_paced: moduleForSelfPaced ?? firstModuleId,
  };
}
