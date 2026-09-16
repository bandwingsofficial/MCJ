import type { StudentCourseDetailDto } from "@/src/features/learning/types/learning.types";

export interface CourseContentMetrics {
  modules: number;
  lessons: number;
  resources: number;
  quizzes: number;
  videos: number;
}

export function getCourseContentMetrics(
  course: StudentCourseDetailDto,
): CourseContentMetrics {
  const moduleTotals = course.modules.reduce(
    (acc, module) => ({
      resources: acc.resources + (module.resourceCount ?? 0),
      quizzes: acc.quizzes + (module.quizCount ?? 0),
      videos:
        acc.videos +
        (module.selfPacedVideoCount ?? 0) +
        (module.liveRecordedVideoCount ?? 0),
    }),
    { resources: 0, quizzes: 0, videos: 0 },
  );

  const courseVideos =
    (course.selfPacedVideoCount ?? 0) + (course.liveRecordedVideoCount ?? 0);

  return {
    modules: course.moduleCount ?? course.modules.length,
    lessons: course.lessonCount ?? 0,
    resources:
      course.resourceCount && course.resourceCount > 0
        ? course.resourceCount
        : moduleTotals.resources,
    quizzes:
      course.quizCount && course.quizCount > 0
        ? course.quizCount
        : moduleTotals.quizzes,
    videos: courseVideos > 0 ? courseVideos : moduleTotals.videos,
  };
}
