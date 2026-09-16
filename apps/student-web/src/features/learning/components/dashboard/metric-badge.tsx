import { cn } from "@/src/shared/lib/cn";

const tones = {
  blue: "border-sky-100 bg-sky-50 text-sky-700",
  green: "border-emerald-100 bg-emerald-50 text-emerald-700",
  yellow: "border-amber-100 bg-amber-50 text-amber-700",
  orange: "border-orange-100 bg-orange-50 text-orange-700",
  purple: "border-violet-100 bg-violet-50 text-violet-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
} as const;

interface MetricBadgeProps {
  label: string;
  value: number;
  tone?: keyof typeof tones;
}

export function MetricBadge({
  label,
  value,
  tone = "blue",
}: MetricBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tones[tone],
      )}
    >
      <span className="font-semibold">{value}</span>
      <span>{label}</span>
    </span>
  );
}
