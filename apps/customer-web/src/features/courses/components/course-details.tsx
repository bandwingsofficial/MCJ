"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { useRouter } from "next/navigation";
import type {
  Course,
} from "@/src/features/courses/types/course.types";

interface CourseDetailsProps {
  course: Course;
}

export function CourseDetails({
  course,
}: CourseDetailsProps) 
{ const router = useRouter();
  return (
    <main className="w-full py-8">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">

          {/* LEFT */}

          <div className="lg:col-span-2 space-y-5">

            <div
              className="
                flex
                h-56
                items-center
                justify-center
                overflow-hidden
                rounded-lg
                border
                border-border
                bg-muted
              "
            >
              {course.thumbnailUrl ? (
                <img
                  src={
                    course.thumbnailUrl
                  }
                  alt={course.title}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  No Thumbnail
                </span>
              )}
            </div>

            <div>

              <div className="flex gap-2 mb-3">
                <Badge variant="info" className="text-[11px] px-2 py-0 uppercase tracking-wide">
                  {course.level}
                </Badge>

                <Badge variant="default" className="text-[11px] px-2 py-0">
                  {course.mode}
                </Badge>
              </div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  sm:text-3xl
                "
              >
                {course.title}
              </h1>

              {course.tagline && (
                <p
                  className="
                    mt-1.5
                    text-sm
                    text-muted-foreground
                  "
                >
                  {course.tagline}
                </p>
              )}
            </div>

            {course.shortDescription && (
              <Card className="p-5">
                <h2
                  className="
                    mb-2.5
                    text-base
                    font-semibold
                  "
                >
                  Overview
                </h2>

                <p className="text-sm leading-relaxed text-muted-foreground">
                  {
                    course.shortDescription
                  }
                </p>
              </Card>
            )}

          </div>

          {/* RIGHT */}

          <div className="lg:sticky lg:top-6">

            <Card className="p-5">

              <div className="space-y-3">

                {course.isFree ? (
                  <div
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    Free
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <span
                      className="
                        text-2xl
                        font-bold
                      "
                    >
                      ₹
                      {
                        course.discountPrice
                      }
                    </span>

                    <span
                      className="
                        text-sm
                        text-muted-foreground
                        line-through
                      "
                    >
                      ₹
                      {
                        course.originalPrice
                      }
                    </span>
                  </div>
                )}

                <div className="text-sm text-muted-foreground border-t border-border/60 pt-3">
                  Language:
                  {" "}
                  <span className="font-medium text-foreground">{course.language}</span>
                </div>

                <Button
                  className="w-full h-10"
                  onClick={() =>
                    router.push(`/courses/${course.slug}/enroll`)
                  }
                >
                  Enroll Now
                </Button>
              </div>

            </Card>

          </div>

        </div>

      </div>
    </main>
  );
}