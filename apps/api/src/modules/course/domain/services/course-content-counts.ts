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

export function accumulateLessonIntoCounts(
  counts: ModuleContentCounts,
  lesson: {
    parentLessonId: string | null;
    contentType: string;
    resourceCount: number;
    hasQuiz: boolean;
  },
): void {
  counts.resourceCount += lesson.resourceCount;

  if (lesson.hasQuiz) {
    counts.quizCount += 1;
  }

  if (lesson.contentType === LessonContentType.SELF_PACED_VIDEO) {
    counts.selfPacedVideoCount += 1;
    return;
  }

  if (lesson.contentType === LessonContentType.LIVE_RECORDED_VIDEO) {
    counts.liveRecordedVideoCount += 1;
    return;
  }

  if (
    !lesson.parentLessonId &&
    lesson.contentType === LessonContentType.LESSON
  ) {
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
