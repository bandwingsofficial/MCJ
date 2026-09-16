import { LessonRecordingPage } from "@/src/features/learning/pages/lesson-recording-page";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function Page({ params }: Props) {
  const { courseId, lessonId } = await params;
  return <LessonRecordingPage courseId={courseId} lessonId={lessonId} />;
}
