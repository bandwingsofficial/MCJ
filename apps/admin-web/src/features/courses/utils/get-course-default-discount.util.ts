import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";

interface CourseDefaultDiscountSource {
  originalPrice?: number | null;
  discountPrice?: number | null;
  totalDiscount?: number | null;
}

export function getCourseDefaultDiscount(
  course: CourseDefaultDiscountSource,
): number {
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
