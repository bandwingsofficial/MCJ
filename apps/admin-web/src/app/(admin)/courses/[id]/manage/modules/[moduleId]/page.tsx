import { CourseModuleManagePage } from "@/src/features/courses/pages/course-module-manage-page";

interface Props {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
}

export default async function CourseModuleManageRoute({ params }: Props) {
  const { id, moduleId } = await params;

  return <CourseModuleManagePage courseId={id} moduleId={moduleId} />;
}
