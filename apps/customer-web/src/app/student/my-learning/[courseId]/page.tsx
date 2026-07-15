import { StudentCoursePage } from "@/src/features/student-course/pages/StudentCoursePage";

interface StudentCourseRouteProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function Page({
  params,
}: StudentCourseRouteProps) {
  const { courseId } =
    await params;

  return (
    <StudentCoursePage
      courseId={courseId}
    />
  );
}