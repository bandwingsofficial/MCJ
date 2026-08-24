"use client";

import { useMemo } from "react";

import { Card } from "@/src/shared/components/ui/card";

import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import type { CourseDetails } from "@/src/features/courses/types/course.types";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";
import { formatCourseLevel } from "@/src/features/branches/utils/branch-display.utils";
import { formatCourseQualifications } from "@/src/features/courses/utils/course-display.utils";
import { getCoursePricing } from "@/src/features/courses/utils/course-pricing.util";
import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";

interface Props {
  course: CourseDetails;
}

function InfoField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export function CourseOverviewInformation({ course }: Props) {
  const categoryName = getCourseCategoryDisplayName(course);
  const pricing = useMemo(() => getCoursePricing(course), [course]);

  const description =
    course.description?.trim() ||
    course.shortDescription?.trim() ||
    course.tagline?.trim() ||
    null;

  const courseFeeLabel = pricing.isFree
    ? "Free"
    : formatCurrency(pricing.discountedPrice);

  const qualificationsLabel = formatCourseQualifications(
    course.minimumQualifications,
  );

  return (
    <Card className="overflow-hidden border-slate-200 bg-white p-0 shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-semibold text-slate-900">
          Course Information
        </h2>
      </div>

      <dl className="grid gap-4 px-4 py-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoField label="Course Name">{course.title}</InfoField>
        <InfoField label="Course Code">{course.code ?? course.slug}</InfoField>
        <InfoField label="Category">{categoryName}</InfoField>
        <InfoField label="Level">{formatCourseLevel(course.level)}</InfoField>
        <InfoField label="Language">{course.language || "—"}</InfoField>
        <InfoField label="Minimum Qualification">
          {qualificationsLabel}
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
      </dl>

      {description ? (
        <div className="border-t border-slate-200 px-4 py-4">
          <h3 className="text-xs font-medium text-slate-500">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {description}
          </p>
        </div>
      ) : null}
    </Card>
  );
}
