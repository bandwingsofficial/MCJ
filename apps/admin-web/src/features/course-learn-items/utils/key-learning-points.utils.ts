export function parseKeyLearningPoints(
  value: string | null | undefined,
): string[] {
  if (!value?.trim()) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed
        .filter((point): point is string => typeof point === "string")
        .map((point) => point);
    }
  } catch {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

export function serializeKeyLearningPoints(points: string[]): string | null {
  const filtered = points.map((point) => point.trim()).filter(Boolean);
  return filtered.length > 0 ? JSON.stringify(filtered) : null;
}
