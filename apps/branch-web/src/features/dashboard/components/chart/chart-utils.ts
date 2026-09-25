export interface ChartPoint {
  label: string;
  value: number;
}

export function isChartEmpty(data: ChartPoint[]): boolean {
  return !data.length || data.every((point) => point.value === 0);
}

export function formatAxisDate(isoDate: string): string {
  const date = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate.slice(5);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function pickLabelIndexes(length: number): Set<number> {
  const indexes = new Set<number>();
  if (length <= 0) return indexes;
  if (length <= 7) {
    for (let i = 0; i < length; i += 1) indexes.add(i);
    return indexes;
  }
  indexes.add(0);
  indexes.add(length - 1);
  indexes.add(Math.floor(length / 2));
  return indexes;
}

export function smoothLinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export const CHART_PALETTE = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#EA580C",
  "#DB2777",
  "#0891B2",
] as const;
