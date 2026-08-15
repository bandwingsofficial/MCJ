import { CoursePreviewPage } from "@/src/features/courses/pages/course-preview-page";

interface Props {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function Page({ params }: Props) {
  const { courseId } = await params;

  return <CoursePreviewPage courseId={courseId} />;
}
