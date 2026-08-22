import { CoursePreviewPage } from "@/src/features/courses/pages/course-preview-page";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function CoursePreviewRoute({ params }: Props) {
  const { id } = await params;

  return <CoursePreviewPage courseId={id} />;
}
