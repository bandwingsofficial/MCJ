import { CourseModuleManagePage } from "@/src/features/courses/pages/course-module-manage-page";

interface Props {
  params: Promise<{
    courseId: string;
    moduleId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { courseId, moduleId } = await params;

  return (
    <CourseModuleManagePage courseId={courseId} moduleId={moduleId} />
  );
}
