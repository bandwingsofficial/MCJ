import { LessonContentType } from '@prisma/client';

export interface ModuleContentCounts {
  lessonCount: number;
  resourceCount: number;
  quizCount: number;
  assignmentCount: number;
  selfPacedVideoCount: number;
  liveRecordedVideoCount: number;
}

export interface CourseContentCounts extends ModuleContentCounts {
  moduleCount: number;
  progressLessonCount: number;
  previewLessonCount: number;
}

export function emptyModuleContentCounts(): ModuleContentCounts {
  return {
    lessonCount: 0,
    resourceCount: 0,
    quizCount: 0,
    assignmentCount: 0,
    selfPacedVideoCount: 0,
    liveRecordedVideoCount: 0,
  };
}

function resolveLessonContentType(
  contentType: string,
  videoUrl: string | null | undefined,
): LessonContentType {
  if (
    contentType === LessonContentType.SELF_PACED_VIDEO ||
    contentType === LessonContentType.LIVE_RECORDED_VIDEO
  ) {
    return contentType as LessonContentType;
  }

  if (contentType === LessonContentType.LESSON) {
    return LessonContentType.LESSON;
  }

  if (videoUrl?.trim()) {
    return LessonContentType.SELF_PACED_VIDEO;
  }

  return LessonContentType.LESSON;
}

/** Matches admin Module Management "Lessons" list (filterNormalLessons). */
export function countsTowardModuleLessonList(lesson: {
  parentLessonId: string | null;
  contentType: string;
  videoUrl?: string | null;
  description?: string | null;
  resourceCount: number;
  hasQuiz: boolean;
}): boolean {
  if (lesson.parentLessonId) {
    return false;
  }

  if (lesson.hasQuiz) {
    return false;
  }

  if (
    resolveLessonContentType(lesson.contentType, lesson.videoUrl) !==
    LessonContentType.LESSON
  ) {
    return false;
  }

  if (
    lesson.resourceCount > 0 &&
    !lesson.description?.trim()
  ) {
    return false;
  }

  return true;
}

export function accumulateLessonIntoCounts(
  counts: ModuleContentCounts,
  lesson: {
    parentLessonId: string | null;
    contentType: string;
    videoUrl?: string | null;
    description?: string | null;
    resourceCount: number;
    hasQuiz: boolean;
  },
): void {
  counts.resourceCount += lesson.resourceCount;

  if (lesson.hasQuiz) {
    counts.quizCount += 1;
  }

  const resolvedType = resolveLessonContentType(
    lesson.contentType,
    lesson.videoUrl,
  );

  if (resolvedType === LessonContentType.SELF_PACED_VIDEO) {
    counts.selfPacedVideoCount += 1;
    return;
  }

  if (resolvedType === LessonContentType.LIVE_RECORDED_VIDEO) {
    counts.liveRecordedVideoCount += 1;
    return;
  }

  if (countsTowardModuleLessonList(lesson)) {
    counts.lessonCount += 1;
  }
}

export function sumModuleContentCounts(
  modules: Iterable<ModuleContentCounts>,
): ModuleContentCounts {
  const total = emptyModuleContentCounts();

  for (const counts of modules) {
    total.lessonCount += counts.lessonCount;
    total.resourceCount += counts.resourceCount;
    total.quizCount += counts.quizCount;
    total.assignmentCount += counts.assignmentCount;
    total.selfPacedVideoCount += counts.selfPacedVideoCount;
    total.liveRecordedVideoCount += counts.liveRecordedVideoCount;
  }

  return total;
}
