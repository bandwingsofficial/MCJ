import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
    segments: string[];
  }>;
}

/**
 * Stable dispatcher for deep course-manage URLs.
 * Keep this as the ONLY route under `manage/` besides `page.tsx`.
 * Do not add competing `manage/modules/...` filesystem pages — they shadow
 * this catch-all and reintroduce intermittent Turbopack 404s.
 *
 * Page modules are loaded lazily so Turbopack only compiles the matched
 * branch (module manage / lesson manage / quiz) instead of all three.
 */
export default async function CourseManageCatchAllRoute({ params }: Props) {
  const { id, segments } = await params;

  if (segments.length === 2 && segments[0] === "modules") {
    const [, moduleId] = segments;
    const { CourseModuleManagePage } = await import(
      "@/src/features/courses/pages/course-module-manage-page"
    );

    return <CourseModuleManagePage courseId={id} moduleId={moduleId} />;
  }

  if (
    segments.length === 5 &&
    segments[0] === "modules" &&
    segments[2] === "lessons" &&
    segments[4] === "manage"
  ) {
    const moduleId = segments[1];
    const lessonId = segments[3];
    const { CourseLessonManagePage } = await import(
      "@/src/features/courses/pages/course-lesson-manage-page"
    );

    return (
      <CourseLessonManagePage
        courseId={id}
        moduleId={moduleId}
        lessonId={lessonId}
      />
    );
  }

  if (
    segments.length === 5 &&
    segments[0] === "modules" &&
    segments[2] === "lessons" &&
    segments[4] === "quiz"
  ) {
    const moduleId = segments[1];
    const lessonId = segments[3];
    const { QuizBuilderPage } = await import(
      "@/src/features/course-quizzes/components/quiz-builder-page"
    );

    return (
      <QuizBuilderPage courseId={id} moduleId={moduleId} lessonId={lessonId} />
    );
  }

  notFound();
}
