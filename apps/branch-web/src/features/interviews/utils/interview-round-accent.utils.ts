const ROUND_ACCENT_PALETTE = [
  "#2563EB",
  "#7C3AED",
  "#0891B2",
  "#059669",
  "#D97706",
  "#DC2626",
  "#DB2777",
  "#4F46E5",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function formatInterviewRoundOrderLabel(input: {
  sortOrder?: number | null;
  name: string;
}): string {
  const name = input.name.trim();
  if (input.sortOrder != null && input.sortOrder >= 1) {
    return `${input.sortOrder}. ${name}`;
  }
  return name;
}

export function getInterviewRoundAccent(input: {
  roundId?: string | null;
  sortOrder?: number | null;
}): string {
  if (input.sortOrder != null && input.sortOrder >= 1) {
    return ROUND_ACCENT_PALETTE[(input.sortOrder - 1) % ROUND_ACCENT_PALETTE.length]!;
  }
  if (input.roundId) {
    return ROUND_ACCENT_PALETTE[hashString(input.roundId) % ROUND_ACCENT_PALETTE.length]!;
  }
  return ROUND_ACCENT_PALETTE[0]!;
}
