import {
  formatCoursePrice,
  getCoursePricing,
  type CoursePricingSource,
} from "./course-pricing.util";

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
