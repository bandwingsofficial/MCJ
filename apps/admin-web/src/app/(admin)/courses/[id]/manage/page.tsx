import { CourseManagePage } from "@/src/features/courses/pages/course-manage-page";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseManageRoute({ params }: Props) {
  const { id } = await params;

  return <CourseManagePage courseId={id} />;
}
