import { StudentWebLmsRedirectPage } from "@/src/features/student-course/pages/student-web-lms-redirect-page";

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function Page({ params }: Props) {
  const { courseId, lessonId } = await params;
  return (
    <StudentWebLmsRedirectPage
      targetPath={`/student/learning/${courseId}/lessons/${lessonId}`}
    />
  );
}
