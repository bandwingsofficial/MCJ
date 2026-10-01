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

export type ModeVideoSelectionByLesson = Record<
  LearningContentMode,
  Record<string, ModeVideoSelection>
>;

export const EMPTY_MODE_VIDEO_SELECTION_BY_LESSON: ModeVideoSelectionByLesson =
  {
    live_recorded: {},
    self_paced: {},
  };

export interface PlayableLessonVideo {
  id: string;
  title: string;
  videoUrl: string;
  duration: number | null;
}

export const EMPTY_MODE_LESSON_SELECTION: ModeNavigationState = {
  live_recorded: null,
  self_paced: null,
};

export const EMPTY_MODE_MODULE_EXPANSION: ModeModuleExpansionState = {
  live_recorded: null,
  self_paced: null,
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

export function getPlayableVideosForMode(
  lesson: LessonTreeDto,
  mode: LearningContentMode,
): PlayableLessonVideo[] {
  if (mode === "live_recorded") {
    return getLiveRecordedVideoEntries(lesson)
      .filter((video) => Boolean(video.videoUrl))
      .map((video) => ({
        id: video.id,
        title: video.title,
        videoUrl: video.videoUrl as string,
        duration: video.duration,
      }));
  }

  const fromList = getSelfPacedVideoEntries(lesson)
    .filter((video) => Boolean(video.videoUrl))
    .map((video) => ({
      id: video.id,
      title: video.title,
      videoUrl: video.videoUrl as string,
      duration: video.duration,
    }));

  if (fromList.length > 0) {
    return fromList;
  }

  if (lesson.videoUrl) {
    return [
      {
        id: `self-paced-primary-${lesson.id}`,
        title: lesson.title,
        videoUrl: lesson.videoUrl,
        duration: lesson.duration,
      },
    ];
  }

  return [];
}

export function getVideoSelectionForLesson(
  map: ModeVideoSelectionByLesson,
  mode: LearningContentMode,
  lessonId: string,
): ModeVideoSelection {
  return map[mode][lessonId] ?? { videoId: null, index: 0 };
}

export function resolveActivePlayableVideo(
  lesson: LessonTreeDto,
  mode: LearningContentMode,
  selection: ModeVideoSelection,
): {
  videos: PlayableLessonVideo[];
  current: PlayableLessonVideo | null;
  currentIndex: number;
} {
  const videos = getPlayableVideosForMode(lesson, mode);

  if (videos.length === 0) {
    return { videos, current: null, currentIndex: 0 };
  }

  let index = selection.index;

  if (selection.videoId) {
    const matchIndex = videos.findIndex(
      (video) => video.id === selection.videoId,
    );
    if (matchIndex >= 0) {
      index = matchIndex;
    }
  }

  index = Math.min(Math.max(index, 0), videos.length - 1);

  return {
    videos,
    current: videos[index] ?? null,
    currentIndex: index,
  };
}

export function formatVideoDuration(seconds: number | null): string | null {
  if (seconds == null || seconds <= 0) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds} sec`;
  }

  return remainingSeconds > 0
    ? `${minutes} min ${remainingSeconds} sec`
    : `${minutes} min`;
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
