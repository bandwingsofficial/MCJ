"use client";

interface Item {
  label: string;
  count: number;
  color?: string;
}

interface Props {
  items: Item[];
  emptyLabel?: string;
}

const DEFAULT_COLORS = [
  "#2563EB",
  "#7C3AED",
  "#059669",
  "#EA580C",
  "#DB2777",
  "#0891B2",
];

export function DistributionBars({
  items,
  emptyLabel = "No records yet.",
}: Props) {
  if (!items.length) {
    return <p className="py-6 text-center text-sm text-[#647A9B]">{emptyLabel}</p>;
  }

  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const width = `${Math.max(6, (item.count / max) * 100)}%`;
        const color = item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length];
        return (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#102A56]">{item.label}</span>
              <span className="tabular-nums text-[#647A9B]">{item.count}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-[#EEF2F8]">
              <div
                className="h-full rounded-full"
                style={{ width, backgroundColor: color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
