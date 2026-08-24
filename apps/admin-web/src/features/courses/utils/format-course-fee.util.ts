import { formatCoursePrice, getCoursePricing } from "./course-pricing.util";

interface CoursePricingSource {
  pricing?: {
    originalPrice?: number | null;
    isFree?: boolean | null;
    currency?: string | null;
  } | null;
}

export function formatCourseFee(course: CoursePricingSource): string {
  const pricing = getCoursePricing(course);

  if (pricing.isFree) {
    return "Free";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: pricing.currency,
    maximumFractionDigits: 2,
  }).format(pricing.originalPrice);
}

export function formatCourseFinalFee(course: CoursePricingSource): string {
  return formatCoursePrice(course);
}
