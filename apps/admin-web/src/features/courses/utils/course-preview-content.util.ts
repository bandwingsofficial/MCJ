import {
  isLiveRecordedVideoLesson,
  isPlainLesson,
  isSelfPacedVideoLesson,
  resolveLessonContentType,
} from "@/src/features/course-modules/utils/module-content.utils";
import { isResourceOnlyLesson } from "@/src/features/courses/utils/course-content-stats.util";
import type {
  CourseLessonTree,
  CourseModuleTree,
  CourseResourceTree,
} from "@/src/features/courses/types/course.types";

export type PreviewContentKind =
  | "lesson"
  | "self-paced-video"
  | "live-recorded-video"
  | "resource"
  | "quiz";

export interface PreviewContentItem {
  id: string;
  title: string;
  kind: PreviewContentKind;
  typeLabel: string;
  fileUrl?: string | null;
  resourceType?: string;
  displayOrder: number;
}

export interface ModulePreviewSections {
  lessons: PreviewContentItem[];
  selfPacedVideos: PreviewContentItem[];
  liveRecordedVideos: PreviewContentItem[];
  resources: PreviewContentItem[];
  quizzes: PreviewContentItem[];
}

const TYPE_LABELS: Record<PreviewContentKind, string> = {
  lesson: "Lesson",
  "self-paced-video": "Self-Paced Video",
  "live-recorded-video": "Live Recorded Video",
  resource: "Resource",
  quiz: "Quiz",
};

function sortByDisplayOrder<T extends { displayOrder: number }>(items: T[]) {
  return [...items].sort((a, b) => a.displayOrder - b.displayOrder);
}

function toLessonItem(
  lesson: CourseLessonTree,
  kind: PreviewContentKind,
): PreviewContentItem {
  return {
    id: lesson.id,
    title: lesson.title,
    kind,
    typeLabel: TYPE_LABELS[kind],
    displayOrder: lesson.displayOrder,
  };
}

function collectResources(
  lessons: CourseLessonTree[],
): PreviewContentItem[] {
  const items: PreviewContentItem[] = [];

  for (const lesson of sortByDisplayOrder(lessons)) {
    for (const resource of sortByDisplayOrder(lesson.resources ?? [])) {
      items.push({
        id: resource.id,
        title: resource.title,
        kind: "resource",
        typeLabel: TYPE_LABELS.resource,
        fileUrl: resource.fileUrl,
        resourceType: resource.type,
        displayOrder: lesson.displayOrder * 1000 + resource.displayOrder,
      });
    }
  }

  return sortByDisplayOrder(items);
}

export function buildModulePreviewSections(
  module: CourseModuleTree,
): ModulePreviewSections {
  const lessons = sortByDisplayOrder(module.lessons ?? []);
  const sections: ModulePreviewSections = {
    lessons: [],
    selfPacedVideos: [],
    liveRecordedVideos: [],
    resources: collectResources(lessons),
    quizzes: [],
  };

  for (const lesson of lessons) {
    if (lesson.quiz) {
      sections.quizzes.push({
        id: lesson.quiz.id,
        title: lesson.quiz.title || lesson.title,
        kind: "quiz",
        typeLabel: TYPE_LABELS.quiz,
        displayOrder: lesson.displayOrder,
      });
      continue;
    }

    const contentType = resolveLessonContentType(lesson);

    if (isLiveRecordedVideoLesson(lesson)) {
      sections.liveRecordedVideos.push(
        toLessonItem(lesson, "live-recorded-video"),
      );
      continue;
    }

    if (isSelfPacedVideoLesson(lesson)) {
      sections.selfPacedVideos.push(
        toLessonItem(lesson, "self-paced-video"),
      );
      continue;
    }

    if (isResourceOnlyLesson(lesson)) {
      continue;
    }

    if (isPlainLesson(lesson) || contentType === "LESSON") {
      sections.lessons.push(toLessonItem(lesson, "lesson"));
    }
  }

  return sections;
}

export function sortModulesForPreview(
  modules: CourseModuleTree[],
): CourseModuleTree[] {
  return [...modules].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function formatModuleHeading(
  module: CourseModuleTree,
  index: number,
): string {
  const order = String(module.displayOrder ?? index + 1).padStart(2, "0");
  return `Module ${order}: ${module.title}`;
}
