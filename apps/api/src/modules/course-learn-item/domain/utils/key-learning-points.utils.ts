export function serializeKeyLearningPoints(
  points: string[] | null | undefined,
): string | null {
  if (!points?.length) {
    return null;
  }

  const filtered = points
    .filter((point): point is string => typeof point === 'string')
    .map((point) => point.trim())
    .filter(Boolean);

  return filtered.length > 0 ? JSON.stringify(filtered) : null;
}
