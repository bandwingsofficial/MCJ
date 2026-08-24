import { Suspense } from "react";

import { EnrollPage } from "@/src/features/enrollments/pages/enroll-page";
import { EnrollmentPageSkeleton } from "@/src/features/enrollments/components/enrollment-page-skeleton";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<EnrollmentPageSkeleton />}>
      <EnrollPage slug={slug} />
    </Suspense>
  );
}
