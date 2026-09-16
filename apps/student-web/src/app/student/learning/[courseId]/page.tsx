import { CourseLearningPage } from "@/src/features/learning/pages/course-learning-page";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function Page({ params }: Props) {
  const { courseId } = await params;
  return <CourseLearningPage courseId={courseId} />;
}
