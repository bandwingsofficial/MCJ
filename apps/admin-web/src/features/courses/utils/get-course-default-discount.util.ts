import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

import {
  getCoursePricing,
  type CoursePricingSource,
} from "./course-pricing.util";

export function getCourseDefaultDiscount(
  course: CoursePricingSource,
): number {
  return getCoursePricing(course).discountAmount;
}

/** @deprecated Use getCourseDefaultDiscount */
export function getCourseDefaultDiscountLegacy(course: {
  originalPrice?: number | null;
  discountPrice?: number | null;
  totalDiscount?: number | null;
}): number {
  const fee = normalizeMoney(course.originalPrice);
  const discountPrice = normalizeMoney(course.discountPrice);

  if (discountPrice > 0 && discountPrice <= fee) {
    return discountPrice;
  }

  const totalDiscount = normalizeMoney(course.totalDiscount);

  if (totalDiscount > 0 && totalDiscount <= fee) {
    return totalDiscount;
  }

  return 0;
}
