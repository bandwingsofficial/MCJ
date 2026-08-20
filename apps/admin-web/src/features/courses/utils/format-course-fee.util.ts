import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";

interface CoursePricingSource {
  isFree?: boolean;
  originalPrice?: number | null;
}

export function formatCourseFee(course: CoursePricingSource): string {
  if (course.isFree) {
    return "Free";
  }

  const price = course.originalPrice;

  if (price == null || Number.isNaN(Number(price))) {
    return "Not set";
  }

  return formatCurrency(Number(price));
}
