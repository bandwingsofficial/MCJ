import { CourseModulesPage } from "@/src/features/course-modules/pages/CourseModulesPage";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseModulesRoute({ params }: Props) {
  const { id } = await params;

  return <CourseModulesPage courseId={id} />;
}
