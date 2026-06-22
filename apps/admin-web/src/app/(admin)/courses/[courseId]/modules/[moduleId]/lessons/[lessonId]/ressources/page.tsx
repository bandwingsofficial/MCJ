import { CourseResourcesPage } from "@/src/features/course-resources/pages/CourseResourcesPage";

interface CourseResourcesRouteProps {
  params: Promise<{
    courseId: string;

    moduleId: string;

    lessonId: string;
  }>;
}

export default async function CourseResourcesRoute({
  params,
}: CourseResourcesRouteProps) {
  const {
    lessonId,
  } = await params;

  return (
    <CourseResourcesPage
      lessonId={lessonId}
    />
  );
}