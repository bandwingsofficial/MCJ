// src/features/courses/utils/course-display.utils.ts

export {
  formatCoursePrice,
  formatCurrency,
  formatDetailCoursePrice,
  getCoursePricing,
  getDiscountPercent,
  hasCourseDiscount,
  type CoursePricing,
} from "@/src/features/courses/utils/course-pricing.utils";

export function formatDuration(
  duration: number | null,
  durationType: string | null,
): string {
  if (!duration) {
    return "—";
  }

  const unit = durationType?.toLowerCase() ?? "months";
  return `${duration} ${unit}`;
}

export function formatCourseLevel(level: string | null | undefined): string {
  if (!level) {
    return "—";
  }

  return level.charAt(0) + level.slice(1).toLowerCase();
}

export function formatCourseMode(mode: string | null | undefined): string {
  if (!mode) {
    return "—";
  }

  return mode.charAt(0) + mode.slice(1).toLowerCase();
}
