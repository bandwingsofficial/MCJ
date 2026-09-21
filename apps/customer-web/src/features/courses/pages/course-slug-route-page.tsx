import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CourseDetailsPage } from "@/src/features/courses/pages/course-details-page";
import { getCourse } from "@/src/features/courses/services/course.service";
import { EnrollPage } from "@/src/features/enrollments/pages/enroll-page";
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
 */
export async function CourseSlugRoutePage({ params }: CourseSlugRouteProps) {
  const { slug, segments = [] } = await params;

  if (!slug?.trim()) {
    notFound();
  }

  if (segments.length === 0) {
    try {
      await getCourse(slug);
    } catch {
      notFound();
    }

    return <CourseDetailsPage slug={slug} />;
  }

  if (segments.length === 1 && segments[0] === "enroll") {
    return (
      <Suspense fallback={<EnrollmentPageSkeleton />}>
        <EnrollPage slug={slug} />
      </Suspense>
    );
  }

  notFound();
}
