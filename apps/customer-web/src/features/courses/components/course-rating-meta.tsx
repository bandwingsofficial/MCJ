import { Star } from "lucide-react";

import {
  formatCourseRatingCountLabel,
  formatCourseRatingValue,
  hasCourseRating,
} from "@/src/features/courses/utils/course-rating.utils";

interface CourseRatingMetaProps {
  rating?: number | null;
  totalReviews?: number | null;
  className?: string;
  emptyClassName?: string;
}

export function CourseRatingMeta({
  rating,
  totalReviews,
  className = "inline-flex items-center gap-1 text-[11px] text-slate-600",
  emptyClassName = "text-[11px] text-slate-400",
}: CourseRatingMetaProps) {
  if (!hasCourseRating(rating, totalReviews)) {
    return <span className={emptyClassName}>No ratings yet</span>;
  }

  return (
    <span className={className}>
      <Star
        className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
        aria-hidden
      />
      <span className="font-semibold text-slate-700">
        {formatCourseRatingValue(rating)}
      </span>
      <span className="text-slate-400" aria-hidden>
        ·
      </span>
      <span>{formatCourseRatingCountLabel(totalReviews)}</span>
    </span>
  );
}
