export const MAX_BIO_WORDS = 150;

export const BIO_WORD_WARNING_THRESHOLD = 140;

export function countWords(value: string): number {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function truncateToMaxWords(
  value: string,
  maxWords: number
): string {
  if (maxWords <= 0) {
    return "";
  }

  const matches = [...value.matchAll(/\S+/g)];

  if (matches.length <= maxWords) {
    return value;
  }

  const lastMatch = matches[maxWords - 1];
  const endIndex =
    (lastMatch.index ?? 0) + lastMatch[0].length;

  return value.slice(0, endIndex);
}

export function getBioWordCountClass(
  count: number,
  max: number = MAX_BIO_WORDS
): string {
  if (count >= max) {
    return "text-red-500";
  }

  if (count >= BIO_WORD_WARNING_THRESHOLD) {
    return "text-amber-600";
  }

  return "text-slate-500";
}
