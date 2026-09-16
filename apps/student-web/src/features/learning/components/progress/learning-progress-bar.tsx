"use client";

import { Progress } from "@/src/shared/components/ui/progress";
import { cn } from "@/src/shared/lib/cn";

interface LearningProgressBarProps {
  value: number;
  label?: string;
  className?: string;
}

export function LearningProgressBar({
  value,
  label,
  className,
}: LearningProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{label}</span>
          <span className="font-semibold text-[#0B1F3A]">{value}%</span>
        </div>
      ) : null}
      <Progress value={value} className="h-1.5 bg-slate-100 [&>div]:bg-[#2563EB]" />
    </div>
  );
}
