import { QuizBuilderPage } from "@/src/features/course-quizzes/components/quiz-builder-page";

interface QuizBuilderRouteProps {
  params: Promise<{
    courseId: string;
    moduleId: string;
    lessonId: string;
  }>;
}

export default async function QuizBuilderRoute({
  params,
}: QuizBuilderRouteProps) {
  const { courseId, moduleId, lessonId } = await params;

  return (
    <QuizBuilderPage
      courseId={courseId}
      moduleId={moduleId}
      lessonId={lessonId}
    />
  );
}
