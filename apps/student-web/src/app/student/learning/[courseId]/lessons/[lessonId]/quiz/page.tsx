import { LessonQuizPage } from "@/src/features/learning/pages/lesson-quiz-page";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function Page({ params }: Props) {
  const { courseId, lessonId } = await params;
  return <LessonQuizPage courseId={courseId} lessonId={lessonId} />;
}
