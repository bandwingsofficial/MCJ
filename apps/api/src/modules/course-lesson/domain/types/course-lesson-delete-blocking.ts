export interface CourseLessonDeleteBlockingItem {
  id: string;
  title: string;
}

export interface CourseLessonDeleteBlockingDependencies {
  selfPacedVideos: CourseLessonDeleteBlockingItem[];
  liveRecordedVideos: CourseLessonDeleteBlockingItem[];
  learnItems: CourseLessonDeleteBlockingItem[];
  resources: CourseLessonDeleteBlockingItem[];
  quizzes: CourseLessonDeleteBlockingItem[];
}

/** Live recorded videos are not treated as delete blockers for parent lessons. */
export function courseLessonHasDeleteBlockingDependencies(
  dependencies: CourseLessonDeleteBlockingDependencies,
): boolean {
  return (
    dependencies.selfPacedVideos.length > 0 ||
    dependencies.learnItems.length > 0 ||
    dependencies.resources.length > 0 ||
    dependencies.quizzes.length > 0
  );
}
