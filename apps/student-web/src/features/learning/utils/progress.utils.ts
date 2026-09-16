import type {
  CourseProgressDto,
  LessonProgressItemDto,
  LessonTreeDto,
  ModuleTreeDto,
} from "@/src/features/learning/types/learning.types";

export type ProgressMap = Map<string, LessonProgressItemDto>;

export type ModuleCompletionState =
  | "completed"
  | "in_progress"
  | "not_started";

export interface ModuleProgressStats {
  totalLessons: number;
  completedLessons: number;
  remainingLessons: number;
  percentage: number;
  state: ModuleCompletionState;
}

export interface CourseProgressStats {
  totalModules: number;
  completedModules: number;
  remainingModules: number;
  totalLessons: number;
  completedLessons: number;
  remainingLessons: number;
  percentage: number;
}

export function buildProgressMap(
  items: LessonProgressItemDto[],
): ProgressMap {
  return new Map(items.map((item) => [item.lessonId, item]));
}

export function isLessonCompleted(
  progressMap: ProgressMap,
  lessonId: string,
): boolean {
  return progressMap.get(lessonId)?.isCompleted ?? false;
}

export function getModuleProgress(
  module: Pick<ModuleTreeDto, "lessons">,
  progressMap: ProgressMap,
): ModuleProgressStats {
  const totalLessons = module.lessons.length;
  const completedLessons = module.lessons.filter((lesson) =>
    isLessonCompleted(progressMap, lesson.id),
  ).length;
  const remainingLessons = Math.max(totalLessons - completedLessons, 0);
  const percentage =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  let state: ModuleCompletionState = "not_started";
  if (totalLessons > 0 && completedLessons >= totalLessons) {
    state = "completed";
  } else if (completedLessons > 0) {
    state = "in_progress";
  }

  return {
    totalLessons,
    completedLessons,
    remainingLessons,
    percentage,
    state,
  };
}

export function getCourseProgressFromModules(
  modules: ModuleTreeDto[],
  progressMap: ProgressMap,
): CourseProgressStats {
  const moduleStats = modules.map((module) =>
    getModuleProgress(module, progressMap),
  );
  const totalModules = modules.length;
  const completedModules = moduleStats.filter(
    (item) => item.state === "completed",
  ).length;
  const totalLessons = moduleStats.reduce(
    (sum, item) => sum + item.totalLessons,
    0,
  );
  const completedLessons = moduleStats.reduce(
    (sum, item) => sum + item.completedLessons,
    0,
  );

  return {
    totalModules,
    completedModules,
    remainingModules: Math.max(totalModules - completedModules, 0),
    totalLessons,
    completedLessons,
    remainingLessons: Math.max(totalLessons - completedLessons, 0),
    percentage:
      totalLessons > 0
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0,
  };
}

export function getCourseProgressStats(
  modules: ModuleTreeDto[],
  progress: CourseProgressDto,
): CourseProgressStats {
  const progressMap = buildProgressMap(progress.items);
  const derived = getCourseProgressFromModules(modules, progressMap);

  return {
    ...derived,
    totalLessons: progress.totalLessons,
    completedLessons: progress.completedLessons,
    remainingLessons: Math.max(
      progress.totalLessons - progress.completedLessons,
      0,
    ),
    percentage: progress.completionPercentage,
  };
}

export function flattenLessons(modules: ModuleTreeDto[]): LessonTreeDto[] {
  return modules
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .flatMap((module) =>
      module.lessons
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder),
    );
}

export function findContinueLesson(
  modules: ModuleTreeDto[],
  progressMap: ProgressMap,
): LessonTreeDto | null {
  const lessons = flattenLessons(modules);
  const nextIncomplete = lessons.find(
    (lesson) => !isLessonCompleted(progressMap, lesson.id),
  );

  return nextIncomplete ?? lessons[0] ?? null;
}

export function getLessonNavigation(
  modules: ModuleTreeDto[],
  lessonId: string,
) {
  const lessons = flattenLessons(modules);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  const current = index >= 0 ? lessons[index] : null;
  const previous = index > 0 ? lessons[index - 1] : null;
  const next =
    index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null;

  return { lessons, current, previous, next, index };
}

export function findModuleForLesson(
  modules: ModuleTreeDto[],
  lessonId: string,
): ModuleTreeDto | null {
  return (
    modules.find((module) =>
      module.lessons.some((lesson) => lesson.id === lessonId),
    ) ?? null
  );
}

export function formatModuleLabel(displayOrder: number): string {
  return `Module ${String(displayOrder + 1).padStart(2, "0")}`;
}

export function formatLessonLabel(displayOrder: number): string {
  return `Lesson ${String(displayOrder + 1).padStart(2, "0")}`;
}
