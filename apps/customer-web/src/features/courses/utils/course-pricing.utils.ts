export interface CoursePricing {
  originalPrice: number;
  discountAmount: number;
  discountPercent: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
}

export const EMPTY_COURSE_PRICING: CoursePricing = {
  originalPrice: 0,
  discountAmount: 0,
  discountPercent: 0,
  discountedPrice: 0,
  currency: "INR",
  isFree: false,
};

export function normalizeCoursePricing(
  pricing?: Partial<CoursePricing> | null,
): CoursePricing {
  if (!pricing) {
    return { ...EMPTY_COURSE_PRICING };
  }

  const originalPrice = Number.isFinite(Number(pricing.originalPrice))
    ? Number(pricing.originalPrice)
    : 0;
  const discountAmount = Number.isFinite(Number(pricing.discountAmount))
    ? Number(pricing.discountAmount)
    : 0;
  const discountedPrice = Number.isFinite(Number(pricing.discountedPrice))
    ? Number(pricing.discountedPrice)
    : Math.max(0, originalPrice - discountAmount);
  const currency = pricing.currency?.trim() || "INR";
  const isFree = Boolean(pricing.isFree);

  if (isFree) {
    return { ...EMPTY_COURSE_PRICING, currency, isFree: true };
  }

  const safeOriginal = Math.max(0, originalPrice);
  const safeDiscount = Math.max(
    0,
    Math.min(discountAmount, safeOriginal),
  );
  const safeDiscounted = Math.max(
    0,
    Math.min(
      discountedPrice > 0 ? discountedPrice : safeOriginal - safeDiscount,
      safeOriginal,
    ),
  );
  const resolvedDiscount =
    safeDiscount > 0
      ? safeDiscount
      : safeDiscounted < safeOriginal
        ? safeOriginal - safeDiscounted
        : 0;
  const discountPercent =
    safeOriginal > 0 && resolvedDiscount > 0
      ? Math.round((resolvedDiscount / safeOriginal) * 10000) / 100
      : 0;

  return {
    originalPrice: safeOriginal,
    discountAmount: resolvedDiscount,
    discountPercent,
    discountedPrice:
      resolvedDiscount > 0 ? safeDiscounted : safeOriginal,
    currency,
    isFree: false,
  };
}

export function getCoursePricing(course: {
  pricing?: Partial<CoursePricing> | null;
}): CoursePricing {
  return normalizeCoursePricing(course.pricing);
}

export function formatCurrency(amount: number, currency = "INR"): string {
  const value = Number.isFinite(amount) ? amount : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCoursePrice(course: {
  pricing?: Partial<CoursePricing> | null;
}): string {
  const pricing = getCoursePricing(course);

  if (pricing.isFree) {
    return "Free";
  }

  return formatCurrency(pricing.discountedPrice, pricing.currency);
}

export function formatDetailCoursePrice(course: {
  pricing?: Partial<CoursePricing> | null;
}): string {
  return formatCoursePrice(course);
}

export function getDiscountPercent(course: {
  pricing?: Partial<CoursePricing> | null;
}): number | null {
  const pricing = getCoursePricing(course);

  if (
    pricing.isFree ||
    pricing.originalPrice <= 0 ||
    pricing.discountAmount <= 0 ||
    pricing.discountedPrice >= pricing.originalPrice
  ) {
    return null;
  }

  const rounded = Math.round(pricing.discountPercent);

  return rounded > 0 ? rounded : null;
}

export function hasCourseDiscount(course: {
  pricing?: Partial<CoursePricing> | null;
}): boolean {
  return getDiscountPercent(course) !== null;
}
