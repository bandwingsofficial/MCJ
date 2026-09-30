import type {
  CoursePreviewLesson,
  CoursePreviewLessonVideo,
} from "@/src/features/courses/types/course.types";

export function previewVideoTypeLabel(
  contentType: CoursePreviewLessonVideo["contentType"],
): string {
  if (contentType === "LIVE_RECORDED_VIDEO") {
    return "Live/Recorded Session";
  }

  if (contentType === "SELF_PACED_VIDEO") {
    return "Self-Paced Video";
  }

  return "Video";
}

export function formatRecordedSessionDate(
  value: string | null | undefined,
): string | null {
  if (!value?.trim()) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getPrimaryPreviewVideoTypeLabel(
  lesson: CoursePreviewLesson,
): string | null {
  const selfCount = lesson.selfPacedVideoCount ?? 0;
  const liveCount = lesson.liveRecordedVideoCount ?? 0;

  if (selfCount === 0 && liveCount === 0) {
    return null;
  }

  if (selfCount > 0 && liveCount === 0) {
    return "Self-Paced Video";
  }

  if (liveCount > 0 && selfCount === 0) {
    return "Live/Recorded Session";
  }

  /*
   * Both types exist; curriculum list does not include child displayOrder.
   * Default to self-paced label until preview fetch resolves the first child.
   */
  return "Self-Paced Video";
}

export function lessonOffersCustomerPreview(
  lesson: CoursePreviewLesson,
): boolean {
  return Boolean(lesson.isPreview) && lessonHasPreviewableVideo(lesson);
}

export function lessonHasPreviewableVideo(
  lesson: CoursePreviewLesson,
): boolean {
  return (
    (lesson.selfPacedVideoCount ?? 0) > 0 ||
    (lesson.liveRecordedVideoCount ?? 0) > 0
  );
}
