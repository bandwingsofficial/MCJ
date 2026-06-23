"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

export function EnrollmentEmpty() {
  const router = useRouter();

  return (
    <div className="py-10">
      <EmptyState
        title="No Enrollments Found"
        description="You haven't enrolled in any course yet."
      />

      <div className="mt-6 flex justify-center">
        <Button
          onClick={() =>
            router.push("/courses")
          }
        >
          Browse Courses
        </Button>
      </div>
    </div>
  );
}