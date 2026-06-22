import { CourseLessonsPage } from "@/src/features/course-lessons/pages/CourseLessonsPage";

interface CourseLessonsRouteProps {
  params: Promise<{
    courseId: string;

    moduleId: string;
  }>;
}

export default async function CourseLessonsRoute({
  params,
}: CourseLessonsRouteProps) {
  const {
    courseId,
    moduleId,
  } = await params;

  return (
    <CourseLessonsPage
      courseId={courseId}
      moduleId={moduleId}
    />
  );
}