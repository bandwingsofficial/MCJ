import { LessonLearningPage } from "@/src/features/learning/pages/lesson-learning-page";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function Page({ params }: Props) {
  const { courseId, lessonId } = await params;
  return <LessonLearningPage courseId={courseId} lessonId={lessonId} />;
}
