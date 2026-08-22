import { CourseLessonsPage } from "@/src/features/course-lessons/pages/CourseLessonsPage";

interface Props {
  params: Promise<{
    id: string;
    moduleId: string;
  }>;
}

export default async function CourseLessonsRoute({ params }: Props) {
  const { id, moduleId } = await params;

  return <CourseLessonsPage courseId={id} moduleId={moduleId} />;
}
