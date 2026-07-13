"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import type {
  TrainerCourse,
} from "@/src/features/trainers/types/trainer.types";

interface TrainerCoursesCardProps {
  courses: TrainerCourse[];
}

export function TrainerCoursesCard({
  courses,
}: TrainerCoursesCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Assigned Courses
          </h3>

          <Badge variant="info">
            {courses.length}{" "}
            {courses.length === 1
              ? "Course"
              : "Courses"}
          </Badge>
        </div>

        {courses.length > 0 ? (
          <div className="space-y-3">
            {courses.map(
              (course) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-medium">
                      {course.title}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      ID: {course.id}
                    </p>
                  </div>

                  <Badge variant="success">
                    Assigned
                  </Badge>
                </div>
              ),
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed py-8 text-center">
            <p className="text-muted-foreground">
              No courses assigned.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}