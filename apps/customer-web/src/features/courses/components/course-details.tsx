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
    <main className="w-full py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-3">

          {/* LEFT */}

          <div className="lg:col-span-2 space-y-6">

            <div
              className="
                flex
                h-80
                items-center
                justify-center
                rounded-xl
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
                    rounded-xl
                    object-cover
                  "
                />
              ) : (
                <span>
                  No Thumbnail
                </span>
              )}
            </div>

            <div>

              <div className="flex gap-2 mb-4">
                <Badge variant="info">
                  {course.level}
                </Badge>

                <Badge variant="default">
                  {course.mode}
                </Badge>
              </div>

              <h1
                className="
                  text-4xl
                  font-bold
                "
              >
                {course.title}
              </h1>

              {course.tagline && (
                <p
                  className="
                    mt-3
                    text-lg
                    text-muted-foreground
                  "
                >
                  {course.tagline}
                </p>
              )}
            </div>

            {course.shortDescription && (
              <Card className="p-6">
                <h2
                  className="
                    mb-4
                    text-xl
                    font-semibold
                  "
                >
                  Overview
                </h2>

                <p>
                  {
                    course.shortDescription
                  }
                </p>
              </Card>
            )}

          </div>

          {/* RIGHT */}

          <div>

            <Card className="p-6">

              <div className="space-y-4">

                {course.isFree ? (
                  <div
                    className="
                      text-3xl
                      font-bold
                    "
                  >
                    Free
                  </div>
                ) : (
                  <>
                    <div
                      className="
                        text-3xl
                        font-bold
                      "
                    >
                      ₹
                      {
                        course.discountPrice
                      }
                    </div>

                    <div
                      className="
                        text-muted-foreground
                        line-through
                      "
                    >
                      ₹
                      {
                        course.originalPrice
                      }
                    </div>
                  </>
                )}

                <div>
                  Language:
                  {" "}
                  {course.language}
                </div>

                <Button
  className="w-full"
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