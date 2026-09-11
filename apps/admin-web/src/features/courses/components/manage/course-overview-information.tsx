"use client";

import {
  BookOpen,
  Globe,
  GraduationCap,
  Hash,
  Star,
  Tag,
} from "lucide-react";

import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import type { CourseDetails } from "@/src/features/courses/types/course.types";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";
import { formatCourseLevel } from "@/src/features/branches/utils/branch-display.utils";
import { formatCourseQualifications } from "@/src/features/courses/utils/course-display.utils";
import {
  formatCourseRatingCountLabel,
  formatCourseRatingValue,
  hasCourseRating,
} from "@/src/features/courses/utils/course-rating.utils";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  course: CourseDetails;
}

function InfoBlock({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof BookOpen;
  iconClass: string;
  bgClass: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E8F0FA] bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            bgClass,
          )}
        >
          <Icon className={cn("h-4 w-4", iconClass)} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            {label}
          </p>
          <div className="mt-1 text-sm font-medium text-[#102A56]">{value}</div>
        </div>
      </div>
    </div>
  );
}

export function CourseOverviewInformation({ course }: Props) {
  const categoryName = getCourseCategoryDisplayName(course);

  const description =
    course.description?.trim() ||
    course.shortDescription?.trim() ||
    course.tagline?.trim() ||
    null;

  const qualificationsLabel = formatCourseQualifications(
    course.minimumQualifications,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
        <h2 className="text-base font-semibold text-[#102A56]">
          Course Information
        </h2>
        <p className="mt-0.5 text-sm text-[#647A9B]">
          Core course details and metadata.
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoBlock
          label="Course Name"
          value={course.title}
          icon={BookOpen}
          iconClass="text-[#2563EB]"
          bgClass="bg-blue-50"
        />
        <InfoBlock
          label="Course Code"
          value={
            <span className="font-mono">{course.code ?? course.slug}</span>
          }
          icon={Hash}
          iconClass="text-violet-600"
          bgClass="bg-violet-50"
        />
        <InfoBlock
          label="Category"
          value={categoryName}
          icon={Tag}
          iconClass="text-emerald-600"
          bgClass="bg-emerald-50"
        />
        <InfoBlock
          label="Level"
          value={formatCourseLevel(course.level)}
          icon={GraduationCap}
          iconClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <InfoBlock
          label="Language"
          value={course.language || "—"}
          icon={Globe}
          iconClass="text-sky-600"
          bgClass="bg-sky-50"
        />
        <InfoBlock
          label="Minimum Qualification"
          value={qualificationsLabel}
          icon={GraduationCap}
          iconClass="text-rose-600"
          bgClass="bg-rose-50"
        />
        <InfoBlock
          label="Rating"
          value={
            hasCourseRating(course.totalReviews)
              ? `★ ${formatCourseRatingValue(course.averageRating)} · ${formatCourseRatingCountLabel(course.totalReviews)}`
              : "No ratings yet"
          }
          icon={Star}
          iconClass="text-amber-600"
          bgClass="bg-amber-50"
        />
        <InfoBlock
          label="Status"
          value={
            <CourseStatusBadge
              status={course.status}
              deletedAt={course.deletedAt}
              isDeleted={course.isDeleted}
            />
          }
          icon={BookOpen}
          iconClass="text-[#2563EB]"
          bgClass="bg-blue-50"
        />
      </div>

      {description ? (
        <div className="border-t border-[#E8F0FA] px-4 py-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            Description
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
            {description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
