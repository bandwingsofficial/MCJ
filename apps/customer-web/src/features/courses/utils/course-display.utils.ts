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

export function getCoursePricing(course: {
  isFree: boolean;
  originalPrice: number;
  discountPrice: number;
  totalDiscount: number;
  currency?: string;
}) {
  const original = Number.isFinite(Number(course.originalPrice))
    ? Number(course.originalPrice)
    : 0;
  const discountPrice = Number.isFinite(Number(course.discountPrice))
    ? Number(course.discountPrice)
    : 0;
  const storedDiscount = Number.isFinite(Number(course.totalDiscount))
    ? Number(course.totalDiscount)
    : 0;
  const totalDiscount =
    storedDiscount > 0 ? storedDiscount : Math.max(0, original - discountPrice);
  const finalPrice = course.isFree
    ? 0
    : discountPrice > 0
      ? discountPrice
      : original;

  return {
    original,
    discountPrice,
    totalDiscount,
    finalPrice: Number.isFinite(finalPrice) ? finalPrice : 0,
    currency: course.currency ?? "INR",
  };
}

export function formatDetailCoursePrice(course: {
  isFree: boolean;
  originalPrice: number;
  discountPrice: number;
  totalDiscount: number;
  currency?: string;
}): string {
  const { finalPrice, currency } = getCoursePricing(course);
  return formatCurrency(finalPrice, currency);
}

export function getDiscountPercent(course: {
  isFree: boolean;
  originalPrice: number;
  discountPrice: number;
  totalDiscount: number;
}): number | null {
  const pricing = getCoursePricing(course);

  if (
    course.isFree ||
    pricing.original <= 0 ||
    pricing.finalPrice >= pricing.original ||
    pricing.totalDiscount <= 0
  ) {
    return null;
  }

  const percent = Math.round((pricing.totalDiscount / pricing.original) * 100);

  return Number.isFinite(percent) && percent > 0 ? percent : null;
}
