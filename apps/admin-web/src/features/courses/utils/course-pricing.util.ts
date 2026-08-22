import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

import { getCourseDefaultDiscount } from "./get-course-default-discount.util";

interface CoursePricingSource {
  isFree?: boolean;
  originalPrice?: number | null;
  discountPrice?: number | null;
  totalDiscount?: number | null;
}

export interface CoursePricingBreakdown {
  feeAmount: number;
  discountAmount: number;
  finalAmount: number;
}

export function getCoursePricing(
  course: CoursePricingSource,
): CoursePricingBreakdown {
  if (course.isFree) {
    return {
      feeAmount: 0,
      discountAmount: 0,
      finalAmount: 0,
    };
  }

  const feeAmount = normalizeMoney(course.originalPrice);
  const discountAmount = getCourseDefaultDiscount(course);
  const finalAmount = Math.max(0, feeAmount - discountAmount);

  return {
    feeAmount,
    discountAmount,
    finalAmount,
  };
}
