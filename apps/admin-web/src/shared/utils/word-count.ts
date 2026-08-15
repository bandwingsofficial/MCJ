export function countWords(value: string): number {
  const normalized = value.trim();
  if (!normalized) {
    return 0;
  }

  return normalized.split(/\s+/).filter(Boolean).length;
}

export function truncateToMaxWords(value: string, maxWords: number): string {
  const words = value.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) {
    return value;
  }

  return words.slice(0, maxWords).join(" ");
}

export function isWithinWordLimit(value: string, maxWords: number): boolean {
  return countWords(value) <= maxWords;
}
