import { StudentWebLmsRedirectPage } from "@/src/features/student-course/pages/student-web-lms-redirect-page";

interface Props {
  params: Promise<{ courseId: string }>;
}

export default async function Page({ params }: Props) {
  const { courseId } = await params;
  return (
    <StudentWebLmsRedirectPage
      targetPath={`/student/learning/${courseId}`}
    />
  );
}
