import type { Metadata } from "next";
import { Suspense } from "react";

import CoursesPage from "@/src/features/courses/pages/course-page";
import { CourseSkeleton } from "@/src/features/courses/components/course-skeleton";

export const metadata: Metadata = {
  title: "Accounting & Tally Courses | MCJ Academy",
  description:
    "Explore practical accounting, Tally, GST, finance and career-focused courses at MCJ Academy, designed to help you build industry-ready skills.",
};

export default function Page() {
  return (
    <Suspense fallback={<CourseSkeleton />}>
      <CoursesPage />
    </Suspense>
  );
}