import type { CourseLesson, LessonContentType } from "@/src/features/course-lessons/types";
import type { CourseResource } from "@/src/features/course-resources/types";
import { formatSecondsToDurationHms } from "@/src/shared/utils/duration";

export function resolveLessonContentType(
  lesson: Pick<CourseLesson, "contentType" | "videoUrl">,
): LessonContentType {
  if (lesson.contentType) {
    return lesson.contentType;
  }

  if (lesson.videoUrl?.trim()) {
    return "SELF_PACED_VIDEO";
  }

  return "LESSON";
}

export function isSelfPacedVideoLesson(
  lesson: Pick<CourseLesson, "contentType" | "videoUrl">,
) {
  return resolveLessonContentType(lesson) === "SELF_PACED_VIDEO";
}

export function isLiveRecordedVideoLesson(
  lesson: Pick<CourseLesson, "contentType">,
) {
  return lesson.contentType === "LIVE_RECORDED_VIDEO";
}

export function isPlainLesson(
  lesson: Pick<CourseLesson, "contentType" | "videoUrl">,
) {
  return resolveLessonContentType(lesson) === "LESSON";
}

/** @deprecated Use isSelfPacedVideoLesson instead */
export function isVideoLesson(lesson: Pick<CourseLesson, "videoUrl" | "contentType">) {
  return isSelfPacedVideoLesson(lesson);
}

export function formatDurationHms(
  durationSeconds: number | null | undefined,
): string {
  if (durationSeconds == null || durationSeconds <= 0) {
    return "—";
  }

  return formatSecondsToDurationHms(durationSeconds);
}

/** @deprecated Use formatDurationHms instead */
export function formatDurationMinutes(
  duration: number | null | undefined,
): string {
  return formatDurationHms(duration);
}

export function formatResourceSize(_resource: CourseResource): string {
  return "—";
}

export function getContentLifecycleLabel(
  item: Pick<CourseLesson, "isDeleted" | "deletedAt">,
) {
  return item.isDeleted || item.deletedAt ? "Archived" : "Active";
}
