import { notFound } from "next/navigation";

import { QuizBuilderPage } from "@/src/features/course-quizzes/components/quiz-builder-page";
import { CourseLessonManagePage } from "@/src/features/courses/pages/course-lesson-manage-page";
import { CourseModuleManagePage } from "@/src/features/courses/pages/course-module-manage-page";

interface Props {
  params: Promise<{
    id: string;
    segments: string[];
  }>;
}

export default async function CourseManageCatchAllRoute({ params }: Props) {
  const { id, segments } = await params;

  if (segments.length === 2 && segments[0] === "modules") {
    const [, moduleId] = segments;

    return <CourseModuleManagePage courseId={id} moduleId={moduleId} />;
  }

  if (
    segments.length === 5 &&
    segments[0] === "modules" &&
    segments[2] === "lessons" &&
    segments[4] === "manage"
  ) {
    const moduleId = segments[1];
    const lessonId = segments[3];

    return (
      <CourseLessonManagePage
        courseId={id}
        moduleId={moduleId}
        lessonId={lessonId}
      />
    );
  }

  if (
    segments.length === 5 &&
    segments[0] === "modules" &&
    segments[2] === "lessons" &&
    segments[4] === "quiz"
  ) {
    const moduleId = segments[1];
    const lessonId = segments[3];

    return (
      <QuizBuilderPage courseId={id} moduleId={moduleId} lessonId={lessonId} />
    );
  }

  notFound();
}
