import { CourseLessonManagePage } from "@/src/features/courses/pages/course-lesson-manage-page";

interface Props {
  params: Promise<{
    id: string;
    moduleId: string;
    lessonId: string;
  }>;
}

export default async function CourseLessonManageRoute({ params }: Props) {
  const { id, moduleId, lessonId } = await params;

  return (
    <CourseLessonManagePage
      courseId={id}
      moduleId={moduleId}
      lessonId={lessonId}
    />
  );
}
