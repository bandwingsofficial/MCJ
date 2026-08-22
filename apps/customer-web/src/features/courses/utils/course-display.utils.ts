export function formatCurrency(amount: number, currency = "INR"): string {
  const value = Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

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

export function formatCoursePrice(course: {
  isFree: boolean;
  discountPrice: number;
  originalPrice: number;
  currency?: string;
}): string {
  if (course.isFree) {
    return "Free";
  }

  return formatCurrency(course.discountPrice, course.currency ?? "INR");
}
