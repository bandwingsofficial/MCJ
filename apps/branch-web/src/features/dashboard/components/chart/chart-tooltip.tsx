"use client";

interface Props {
  visible: boolean;
  x: number | string;
  y: number | string;
  title: string;
  value: string;
  usePercent?: boolean;
}

export function ChartTooltip({
  visible,
  x,
  y,
  title,
  value,
  usePercent = false,
}: Props) {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-[#DCE8F5] bg-white px-2.5 py-1.5 text-xs shadow-[0_8px_20px_rgba(16,42,86,0.12)]"
      style={{
        left: typeof x === "number" ? x : x,
        top: typeof y === "number" ? y : y,
      }}
    >
      <p className="font-medium text-[#647A9B]">{title}</p>
      <p className="font-semibold tabular-nums text-[#102A56]">{value}</p>
    </div>
  );
}
