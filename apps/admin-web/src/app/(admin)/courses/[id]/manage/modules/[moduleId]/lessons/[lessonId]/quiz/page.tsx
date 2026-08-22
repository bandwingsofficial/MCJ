import { QuizBuilderPage } from "@/src/features/course-quizzes/components/quiz-builder-page";

interface Props {
  params: Promise<{
    id: string;
    moduleId: string;
    lessonId: string;
  }>;
}

export default async function QuizBuilderRoute({ params }: Props) {
  const { id, moduleId, lessonId } = await params;

  return (
    <QuizBuilderPage
      courseId={id}
      moduleId={moduleId}
      lessonId={lessonId}
    />
  );
}
