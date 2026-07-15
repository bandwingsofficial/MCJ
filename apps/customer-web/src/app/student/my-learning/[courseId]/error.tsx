"use client";

import { CourseError } from "@/src/features/student-course/components/states/CourseError";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <CourseError
      message="Unable to load the course."
      onRetry={reset}
    />
  );
}