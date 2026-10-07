export function estimateFinanceNewsReadingTimeMinutes(
  content: string | null | undefined,
  shortDescription?: string | null,
): number | null {
  const text = [shortDescription, content].filter(Boolean).join(" ").trim();

  if (!text) {
    return null;
  }

  const words = text.split(/\s+/).filter(Boolean).length;
  if (words === 0) {
    return null;
  }

  return Math.max(1, Math.round(words / 200));
}
