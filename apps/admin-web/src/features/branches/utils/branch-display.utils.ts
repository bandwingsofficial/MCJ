import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";

import {
  formatCoursePrice as formatFinalCoursePrice,
  getCoursePricing,
} from "@/src/features/courses/utils/course-pricing.util";

interface BranchCoursePricingSource {
  pricing?: {
    originalPrice?: number | null;
    discountedPrice?: number | null;
    currency?: string | null;
    isFree?: boolean | null;
  } | null;
}

export function formatCoursePrice(
  course: BranchCoursePricingSource,
): string {
  return formatFinalCoursePrice(course);
}

export function formatCourseOriginalPrice(
  course: BranchCoursePricingSource,
): string {
  const pricing = getCoursePricing(course);

  if (pricing.isFree) {
    return "Free";
  }

  return formatCurrency(pricing.originalPrice, pricing.currency);
}
