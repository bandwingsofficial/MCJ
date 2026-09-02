export function formatCourseRatingValue(
  rating: number | null | undefined,
): string {
  const value = Number(rating ?? 0);

  if (!Number.isFinite(value)) {
    return "0.0";
  }

  if (Number.isInteger(value)) {
    return `${value}.0`;
  }

  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function formatCourseRatingCountLabel(
  count: number | null | undefined,
): string {
  const value = Number(count ?? 0);

  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return value === 1 ? "1 rating" : `${value} ratings`;
}

export function hasCourseRating(
  rating: number | null | undefined,
  count: number | null | undefined,
): boolean {
  const reviewCount = Number(count ?? 0);
  return Number.isFinite(reviewCount) && reviewCount > 0;
}
