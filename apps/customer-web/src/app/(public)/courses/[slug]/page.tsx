import { notFound } from "next/navigation";

import { CourseDetailsPage } from "@/src/features/courses/pages/course-details-page";
import { getCourse } from "@/src/features/courses/services/course.service";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  if (!slug?.trim()) {
    notFound();
  }

  try {
    // Resolve by persisted slug (or UUID when the path segment is an id).
    await getCourse(slug);
  } catch {
    notFound();
  }

  return <CourseDetailsPage slug={slug} />;
}
