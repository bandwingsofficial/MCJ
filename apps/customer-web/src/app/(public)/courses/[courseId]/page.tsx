import {
  CourseDetailsPage,
} from "@/src/features/courses/pages/course-details-page";

interface PageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function Page({
  params,
}: PageProps) {
  const {
    courseId,
  } = await params;

  return (
    <CourseDetailsPage
      courseId={courseId}
    />
  );
}
