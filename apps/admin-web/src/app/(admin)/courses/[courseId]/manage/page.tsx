import { CourseManagePage } from "@/src/features/courses/pages/course-manage-page";

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { courseId } = await params;

  return <CourseManagePage courseId={courseId} />;
}
