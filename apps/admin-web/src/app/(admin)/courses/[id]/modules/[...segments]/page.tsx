import { notFound } from "next/navigation";

interface Props {
  params: Promise<{
    id: string;
    segments: string[];
  }>;
}

/**
 * Stable dispatcher for deep course-modules URLs.
 * Keep this as the ONLY route under `modules/` besides `page.tsx`.
 * Do not add competing `modules/[moduleId]/...` filesystem pages.
 *
 * Page modules are loaded lazily so Turbopack only compiles the matched
 * branch (lessons list / resources) instead of both.
 */
export default async function CourseModulesCatchAllRoute({ params }: Props) {
  const { id, segments } = await params;

  if (segments.length === 2 && segments[1] === "lessons") {
    const [moduleId] = segments;
    const { CourseLessonsPage } = await import(
      "@/src/features/course-lessons/pages/CourseLessonsPage"
    );

    return <CourseLessonsPage courseId={id} moduleId={moduleId} />;
  }

  if (
    segments.length === 4 &&
    segments[1] === "lessons" &&
    segments[3] === "resources"
  ) {
    const [, , lessonId] = segments;
    const { CourseResourcesPage } = await import(
      "@/src/features/course-resources/pages/CourseResourcesPage"
    );

    return <CourseResourcesPage lessonId={lessonId} />;
  }

  notFound();
}
