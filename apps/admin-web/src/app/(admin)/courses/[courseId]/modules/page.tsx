import { CourseModulesPage } from "@/src/features/course-modules/pages/CourseModulesPage";

interface CourseModulesRouteProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CourseModulesRoute({
  params,
}: CourseModulesRouteProps) {
  const { courseId } = await params;

  return (
    <CourseModulesPage
      courseId={courseId}
    />
  );
}