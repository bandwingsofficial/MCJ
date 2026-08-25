"use client";

import { Sheet } from "@/src/shared/components/ui/sheet";

import { Card } from "@/src/shared/components/ui/card";

import { Separator } from "@/src/shared/components/ui/separator";

import {
  CourseDetails,
} from "@/src/features/courses/types/course.types";
import { formatCourseFee } from "@/src/features/courses/utils/format-course-fee.util";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";

import { CourseStatusBadge } from "./course-status-badge";

interface Props {
  open: boolean;

  course: CourseDetails | null;

  onClose: () => void;
}

export function CourseViewSheet({
  open,
  course,
  onClose,
}: Props) {
  if (!course) {
    return null;
  }

  return (
    <Sheet
      open={open}
      title="Course Details"
      onClose={onClose}
    >
      <div className="space-y-4">
        <Card>
          <div className="space-y-3 p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Title
              </p>

              <p className="font-medium">
                {course.title}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">
                Tagline
              </p>

              <p>
                {course.tagline ??
                  "-"}
              </p>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground">
                Status
              </p>

              <CourseStatusBadge
                status={
                  course.status
                }
              />
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3 p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Level
              </p>

              <p>
                {course.level}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Language
              </p>

              <p>
                {
                  course.language
                }
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3 p-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Course Fee
              </p>

              <p>{formatCourseFee(course)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Default Discount
              </p>

              <p>
                {course.pricing.isFree
                  ? "—"
                  : formatCurrency(course.pricing.discountAmount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Final Price
              </p>

              <p>
                {course.pricing.isFree
                  ? "Free"
                  : formatCurrency(course.pricing.discountedPrice)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Is Free
              </p>

              <p>
                {course.pricing.isFree
                  ? "Yes"
                  : "No"}
              </p>
            </div>
          </div>
        </Card>

        {course.description && (
          <Card>
            <div className="p-4">
              <p className="text-sm text-muted-foreground mb-2">
                Description
              </p>

              <p>
                {
                  course.description
                }
              </p>
            </div>
          </Card>
        )}
      </div>
    </Sheet>
  );
}