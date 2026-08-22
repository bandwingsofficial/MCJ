import { CourseResourcesPage } from "@/src/features/course-resources/pages/CourseResourcesPage";

interface Props {
  params: Promise<{
    id: string;
    moduleId: string;
    lessonId: string;
  }>;
}

export default async function CourseResourcesRoute({ params }: Props) {
  const { lessonId } = await params;

  return <CourseResourcesPage lessonId={lessonId} />;
}
