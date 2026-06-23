"use client";

import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { appToast } from "@/src/shared/components/ui/toast";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AUTH_ROUTES } from "@/src/features/auth/constants/auth.constants";

import type {
  Course,
} from "@/src/features/courses/types/course.types";

interface CourseCardProps {
  course: Course;
  onClick?: (
    course: Course
  ) => void;
}

export function CourseCard({
  course,
  onClick,
}: CourseCardProps) {
  const router = useRouter();

  const user = useAuthStore(
    (state) => state.user
  );

  const handleBuyNow = () => {
    if (!user) {
      router.push(
        AUTH_ROUTES.LOGIN
      );

      return;
    }

    appToast.success(
      "Course purchase feature coming soon."
    );
  };

  return (
    <Card
      className="
        group
        h-full
        overflow-hidden
        border
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
      "
    >
      <div className="flex h-full flex-col">

        {/* Thumbnail */}

        <div
          className="
            relative
            flex
            h-52
            items-center
            justify-center
            overflow-hidden
            bg-muted
          "
        >
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="
                h-full
                w-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                flex
                h-full
                w-full
                items-center
                justify-center
                bg-gradient-to-br
                from-muted
                to-muted/50
              "
            >
              <span
                className="
                  text-sm
                  font-medium
                  text-muted-foreground
                "
              >
                No Thumbnail
              </span>
            </div>
          )}

          {course.isFeatured && (
            <div className="absolute left-3 top-3">
              <Badge variant="warning">
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}

        <div className="flex flex-1 flex-col p-5">

          {/* Tags */}

          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="info">
              {course.level}
            </Badge>

            <Badge variant="default">
              {course.mode}
            </Badge>
          </div>

          {/* Title */}

          <h3
            className="
              line-clamp-2
              text-xl
              font-bold
            "
          >
            {course.title}
          </h3>

          {/* Tagline */}

          {course.tagline && (
            <p
              className="
                mt-2
                line-clamp-2
                text-sm
                text-muted-foreground
              "
            >
              {course.tagline}
            </p>
          )}

          {/* Language */}

          <div className="mt-4">
            <span
              className="
                text-sm
                text-muted-foreground
              "
            >
              Language:
            </span>

            <span className="ml-2 text-sm font-medium">
              {course.language}
            </span>
          </div>

          {/* Price */}

          <div className="mt-5">

            {course.isFree ? (
              <div
                className="
                  text-2xl
                  font-bold
                  text-green-600
                "
              >
                Free
              </div>
            ) : (
              <div className="space-y-1">

                <div className="flex items-center gap-3">

                  <span
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    ₹{course.discountPrice}
                  </span>

                  <span
                    className="
                      text-sm
                      text-muted-foreground
                      line-through
                    "
                  >
                    ₹{course.originalPrice}
                  </span>
                </div>

                {course.totalDiscount > 0 && (
                  <p
                    className="
                      text-xs
                      font-medium
                      text-green-600
                    "
                  >
                    Save ₹
                    {
                      course.totalDiscount
                    }
                  </p>
                )}

              </div>
            )}
          </div>

          {/* Actions */}

          <div className="mt-auto pt-6">

            <div className="grid grid-cols-2 gap-3">

              <Button
                variant="outline"
                onClick={() =>
                  onClick?.(course)
                }
              >
                View Course
              </Button>

              <Button
  className="w-full"
  onClick={() =>
    router.push(`/courses/${course.slug}/enroll`)
  }
>
  Enroll Now
</Button>

            </div>

          </div>

        </div>
      </div>
    </Card>
  );
}