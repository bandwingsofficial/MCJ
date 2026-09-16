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
        .map((point) => point.trim())
        .filter(Boolean);
    }
  } catch {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}
