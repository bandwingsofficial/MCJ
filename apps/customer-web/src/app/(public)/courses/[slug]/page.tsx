import { CourseDetailsPage } from "@/src/features/courses/pages/course-details-page";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <CourseDetailsPage slug={slug} />;
}
