import type { ModuleDeleteContentCounts } from "@/src/features/course-modules/components/CourseModuleDeleteDialog";

export interface CourseModuleBlockingLesson {
  lessonId: string;
  lessonTitle: string;
}

export function buildModuleDeleteBlockedDescription(
  blockingLessons: CourseModuleBlockingLesson[],
): string {
  if (blockingLessons.length === 0) {
    return "Module cannot be deleted because it contains lessons.";
  }

  const lines = blockingLessons.map(
    (lesson) => `- ${lesson.lessonTitle}`,
  );

  return [
    "Module cannot be deleted because it contains the following lesson(s):",
    "",
    ...lines,
  ].join("\n");
}

export function buildModuleDeactivateBlockedDescription(
  blockingLessons: CourseModuleBlockingLesson[],
): string {
  if (blockingLessons.length === 0) {
    return "Module cannot be deactivated because it contains lessons.";
  }

  const lines = blockingLessons.map(
    (lesson) => `- ${lesson.lessonTitle}`,
  );

  return [
    "Module cannot be deactivated because it contains the following lesson(s):",
    "",
    ...lines,
  ].join("\n");
}

export function buildModuleDeactivateConfirmDescription(
  moduleTitle: string | undefined,
): string {
  const title = moduleTitle?.trim() || "this module";
  return `Are you sure you want to deactivate "${title}"?`;
}

export function buildModuleActivateConfirmDescription(
  moduleTitle: string | undefined,
): string {
  const title = moduleTitle?.trim() || "this module";
  return `Are you sure you want to activate "${title}"?`;
}

export function buildModuleDeleteConfirmDescription(
  moduleTitle: string | undefined,
  contentCounts?: ModuleDeleteContentCounts,
): string {
  const title = moduleTitle?.trim() || "this module";
  const lines = [
    `Are you sure you want to permanently delete "${title}"?`,
    "",
    "This action cannot be undone. The module will be removed from the course.",
  ];

  if (
    contentCounts &&
    (contentCounts.resources > 0 ||
      contentCounts.quizzes > 0 ||
      contentCounts.assignments > 0)
  ) {
    lines.push(
      "",
      "This module contains associated content that will also be permanently deleted:",
    );

    if (contentCounts.resources > 0) {
      lines.push(
        `• ${contentCounts.resources} resource${contentCounts.resources === 1 ? "" : "s"}`,
      );
    }

    if (contentCounts.quizzes > 0) {
      lines.push(
        `• ${contentCounts.quizzes} quiz${contentCounts.quizzes === 1 ? "" : "zes"}`,
      );
    }

    if (contentCounts.assignments > 0) {
      lines.push(
        `• ${contentCounts.assignments} assignment${contentCounts.assignments === 1 ? "" : "s"}`,
      );
    }
  }

  return lines.join("\n");
}
