import {
  BookOpen,
  CalendarDays,
  Globe,
  GraduationCap,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";

import {
  COURSE_DURATION_LABELS,
  COURSE_LEVEL_LABELS,
} from "@/src/features/student-course/constants/course.constants";

import type {
  StudentCourse,
} from "@/src/features/student-course/types/course.types";

interface AboutCourseProps {
  course: StudentCourse;
}

export function AboutCourse({
  course,
}: AboutCourseProps) {
  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-6 w-6 text-primary" />

        <div>
          <h2 className="text-xl font-semibold">
            About This Course
          </h2>

          <p className="text-sm text-muted-foreground">
            Learn more about this course before you continue.
          </p>
        </div>
      </div>

      <Separator />

      {course.description ? (
        <div className="prose max-w-none dark:prose-invert">
          <p className="leading-8 text-muted-foreground">
            {course.description}
          </p>
        </div>
      ) : (
        <p className="leading-8 text-muted-foreground">
          {course.shortDescription ??
            "No course description has been provided yet."}
        </p>
      )}

      <Separator />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-10 w-10 rounded-lg bg-primary/10 p-2 text-primary" />

          <div>
            <p className="text-xs text-muted-foreground">
              Level
            </p>

            <p className="font-medium">
              {
                COURSE_LEVEL_LABELS[
                  course.level
                ]
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <CalendarDays className="h-10 w-10 rounded-lg bg-blue-500/10 p-2 text-blue-500" />

          <div>
            <p className="text-xs text-muted-foreground">
              Duration
            </p>

            <p className="font-medium">
              {course.duration}{" "}
              {
                COURSE_DURATION_LABELS[
                  course.durationType
                ]
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Globe className="h-10 w-10 rounded-lg bg-green-500/10 p-2 text-green-500" />

          <div>
            <p className="text-xs text-muted-foreground">
              Language
            </p>

            <p className="font-medium">
              {course.language}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs text-muted-foreground">
            Category
          </p>

          <Badge variant="info">
            {course.categoryId}
          </Badge>
        </div>
      </div>
    </Card>
  );
}