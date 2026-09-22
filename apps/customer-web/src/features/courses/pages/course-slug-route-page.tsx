import { notFound } from "next/navigation";
import { Suspense } from "react";

import { EnrollmentPageSkeleton } from "@/src/features/enrollments/components/enrollment-page-skeleton";

interface CourseSlugRouteProps {
  params: Promise<{
    slug: string;
    segments?: string[];
  }>;
}

/**
 * Handles `/courses/:slug` and `/courses/:slug/enroll`.
 * Kept outside the `[[...segments]]` app folder so module resolution
 * is not affected by bracket-path IDE/bundler edge cases.
 *
 * Branch pages are imported lazily so viewing course details does not
 * also compile the large enroll flow (and vice versa).
 */
export async function CourseSlugRoutePage({ params }: CourseSlugRouteProps) {
  const { slug, segments = [] } = await params;

  if (!slug?.trim()) {
    notFound();
  }

  if (segments.length === 0) {
    const { getCourse } = await import(
      "@/src/features/courses/services/course.service"
    );
    try {
      await getCourse(slug);
    } catch {
      notFound();
    }

    const { CourseDetailsPage } = await import(
      "@/src/features/courses/pages/course-details-page"
    );
    return <CourseDetailsPage slug={slug} />;
  }

  if (segments.length === 1 && segments[0] === "enroll") {
    const { EnrollPage } = await import(
      "@/src/features/enrollments/pages/enroll-page"
    );
    return (
      <Suspense fallback={<EnrollmentPageSkeleton />}>
        <EnrollPage slug={slug} />
      </Suspense>
    );
  }

  notFound();
}
