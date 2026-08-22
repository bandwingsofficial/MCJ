import { Suspense } from "react";

import CoursesPage from "@/src/features/courses/pages/course-page";
import { CourseSkeleton } from "@/src/features/courses/components/course-skeleton";

export default function Page() {
  return (
    <Suspense fallback={<CourseSkeleton />}>
      <CoursesPage />
    </Suspense>
  );
}
