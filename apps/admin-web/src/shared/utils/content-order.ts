/**
 * Formats a 1-based visual position for module content rows.
 * Uses zero-padding for positions under 100 (01–99).
 */
export function formatContentOrderNumber(position: number): string {
  if (position < 1) {
    return "01";
  }

  if (position < 100) {
    return String(position).padStart(2, "0");
  }

  return String(position);
}
