"use client";

import { useMemo } from "react";
import { Pencil } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import type { CourseDetails } from "@/src/features/courses/types/course.types";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";
import { getCoursePricing } from "@/src/features/courses/utils/course-pricing.util";
import {
  formatCourseDuration,
  formatCourseLevel,
} from "@/src/features/branches/utils/branch-display.utils";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";

interface Props {
  course: CourseDetails;
  onEditCourse?: () => void;
}

function InfoField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export function CourseOverviewInformation({ course, onEditCourse }: Props) {
  const categoryName = getCourseCategoryDisplayName(course);
  const pricing = useMemo(() => getCoursePricing(course), [course]);

  const description =
    course.description?.trim() ||
    course.shortDescription?.trim() ||
    course.tagline?.trim() ||
    "—";

  const courseFeeLabel = pricing.isFree
    ? "Free"
    : formatCurrency(pricing.discountedPrice);

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900">
          Course Information
        </h2>
        {onEditCourse ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onEditCourse}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit Course
          </Button>
        ) : null}
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <InfoField label="Course Name">{course.title}</InfoField>
        <InfoField label="Course Code">{course.code ?? course.slug}</InfoField>
        <InfoField label="Category">{categoryName}</InfoField>
        <InfoField label="Type">{formatCourseLevel(course.level)}</InfoField>
        <InfoField label="Duration">
          {formatCourseDuration(course.duration, course.durationType)}
        </InfoField>
        <InfoField label="Course Fee">{courseFeeLabel}</InfoField>
        <InfoField label="Status">
          <CourseStatusBadge
            status={course.status}
            deletedAt={course.deletedAt}
            isDeleted={course.isDeleted}
          />
        </InfoField>
        {!pricing.isFree ? (
          <InfoField label="Discount">
            {formatCurrency(pricing.discountAmount)}
          </InfoField>
        ) : null}
        <div className="sm:col-span-2">
          <InfoField label="Description">{description}</InfoField>
        </div>
      </dl>
    </Card>
  );
}
